import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import client, { getSocketOrigin } from '../api/client';


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
    setNotifications(prev => [{
      id: Date.now(),
      date: new Date(),
      read: false,
      ...notif
    }, ...prev].slice(0, 20));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

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
    }
  }, [currentCoop?._id, loadForumStats]);

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
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        loadCoops();
      } catch {
        localStorage.removeItem('agrix_user');
        localStorage.removeItem('agrix_token');
      }
    }
    setLoading(false);
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

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        coops, 
        pendingCoops, 
        currentCoop, 
        loading,
        login,
        logout,
        setCurrentCoop,
        refreshCoops: loadCoops,
        addNotification,
        markAllRead,
        socket: socketRef.current,
        unreadForumCount,
        setUnreadForumCount,
        notifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
