import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import client, { getSocketOrigin } from '../api/client';
import LoadingScreen from '../components/LoadingScreen';


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [coops, setCoops] = useState([]);
  const [currentCoop, setCurrentCoopState] = useState(null);
  const [pendingCoops, setPendingCoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadForumCount, setUnreadForumCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);


  const addNotification = useCallback((notif) => {
    setNotifications(prev => {
      const nid = notif._id || notif.id;
      if (nid && prev.some(n => (n._id || n.id) === nid)) return prev;
      return [{
        id: nid || Date.now(),
        date: notif.createdAt || notif.date || new Date(),
        read: notif.readBy?.includes(user?._id) || false,
        ...notif
      }, ...prev].slice(0, 20);
    });
  }, [user?._id]);

  const markRead = useCallback(async (notifId) => {
    try {
      await client.post(`/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => 
        (n._id || n.id) === notifId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!currentCoop?._id) return;
    try {
      await client.post(`/cooperatives/${currentCoop._id}/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [currentCoop?._id]);

  const loadCoops = useCallback(async () => {
    try {
      const res = await client.get('/me/coops');
      const fetchedCoops = res.data?.memberCoops || [];
      const fetchedPending = res.data?.pendingCoops || [];
      
      setCoops(fetchedCoops);
      setPendingCoops(fetchedPending);
      
      if (fetchedCoops.length > 0) {
        setCurrentCoopState(fetchedCoops[0]);
      } else if (fetchedPending.length > 0) {
        setCurrentCoopState(null); // Pas de coop active par défaut si seulement en attente
      } else {
        setCurrentCoopState(null);
      }
    } catch (err) {
      console.error('Erreur chargement coopératives:', err.message || err);
      setCoops([]);
      setPendingCoops([]);
      setCurrentCoopState(null);
    }
  }, []);

  const loadForumStats = useCallback(async (coopId) => {
    if (!coopId) return;
    try {
      const res = await client.get(`/cooperatives/${coopId}/forums`);
      const threads = res.data || [];
      const stored = localStorage.getItem(`read_counts_${user?._id}`);
      const readCounts = stored ? JSON.parse(stored) : {};
      
      let total = 0;
      threads.forEach(t => {
        const lastRead = readCounts[t._id] || 0;
        const diff = (t.postCount || 0) - lastRead;
        if (diff > 0) total += diff;
      });
      setUnreadForumCount(total);
    } catch (err) {
      console.error('Forum stats error:', err);
    }
  }, [user?._id]);

  useEffect(() => {
    if (currentCoop?._id) {
      loadForumStats(currentCoop._id);
      
      // Load notifications
      client.get(`/cooperatives/${currentCoop._id}/notifications`)
        .then(res => {
          if (res.data) {
            // Add them in reverse chronological order to maintain correct history
            [...res.data].reverse().forEach(n => addNotification(n));
          }
        })
        .catch(err => console.error('Erreur chargement notifications:', err));
    }
  }, [currentCoop?._id, loadForumStats, addNotification]);

  // ── Gestion globale du Socket ───────────────────────────────────
  useEffect(() => {
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      const socket = io(getSocketOrigin(), {
        auth: { userId: user._id },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('Global socket connected');
        if (currentCoop?._id) {
          socket.emit('join_coop', currentCoop._id);
        }
      });

      socket.on('stats_update', (payload) => {
        if (payload.message) {
          addNotification({
            title: 'Mise à jour Coop',
            message: payload.message,
            type: payload.type || 'info'
          });
        }
      });

      socket.on('new_notification', (notif) => {
        addNotification(notif);
      });

      socketRef.current = socket;
    } else {
      // Si la coop change, on rejoint la nouvelle salle
      if (currentCoop?._id) {
        socketRef.current.emit('join_coop', currentCoop._id);
      }
    }

    return () => {
      // On ne déconnecte pas ici pour éviter les reconnexions inutiles
      // mais on pourrait nettoyer les listeners si besoin.
    };
  }, [user?._id, currentCoop?._id, addNotification]);


  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('agrix_user');
    const storedToken = localStorage.getItem('agrix_token');
    
    const init = async () => {
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          await loadCoops();
        } catch (e) {
          console.error("Auth init error:", e);
          localStorage.removeItem('agrix_user');
          localStorage.removeItem('agrix_token');
        }
      }
      setLoading(false);
    };

    init();
  }, [loadCoops]);

  const setCurrentCoop = (coop) => {
    setCurrentCoopState(coop);
  };

  const login = async (identifier, password) => {
    const res = await client.post('/login', { identifier, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('agrix_token', token);
    localStorage.setItem('agrix_user', JSON.stringify(userData));
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    await loadCoops();
    return userData;
  };

  const register = async (regData) => {
    const res = await client.post('/users', regData);
    const { token, ...newUser } = res.data;
    localStorage.setItem('agrix_token', token);
    localStorage.setItem('agrix_user', JSON.stringify(newUser));
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(newUser);
    await loadCoops();
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('agrix_user');
    localStorage.removeItem('agrix_token');
    delete client.defaults.headers.common['Authorization'];
    setUser(null);
    setCoops([]);
    setCurrentCoopState(null);
  };

  const markGuideSeen = async () => {
    try {
      await client.post('/users/guide-seen');
      const updatedUser = { ...user, hasSeenGuide: true };
      setUser(updatedUser);
      localStorage.setItem('agrix_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Erreur lors de la validation du guide', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        coops, 
        pendingCoops, 
        currentCoop, 
        loading,
        login,
        register,
        logout,
        markGuideSeen,
        setCurrentCoop,
        refreshCoops: loadCoops,
        addNotification,
        markRead,
        markAllRead,
        socket: socketRef.current,
        unreadForumCount,
        setUnreadForumCount,
        notifications
      }}
    >
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};
