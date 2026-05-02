import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [coops, setCoops] = useState([]);
  const [currentCoop, setCurrentCoopState] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCoops = useCallback(async () => {
    try {
      const res = await client.get('/me/coops');
      const fetchedCoops = res.data?.memberCoops || [];
      setCoops(fetchedCoops);
      setCurrentCoopState((prev) => {
        // Keep current selection if still valid
        if (prev?._id && fetchedCoops.some((c) => c._id === prev._id)) return prev;
        return fetchedCoops[0] ?? null;
      });
    } catch (err) {
      console.error('Erreur chargement coopératives:', err.message || err);
      setCoops([]);
      setCurrentCoopState(null);
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('agrix_user');
    const storedToken = localStorage.getItem('agrix_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('agrix_user');
        localStorage.removeItem('agrix_token');
      }
    }
    setLoading(false);
  }, []);

  // Load coops whenever user changes
  useEffect(() => {
    if (user?._id) {
      loadCoops();
    } else {
      setCoops([]);
      setCurrentCoopState(null);
    }
  }, [user?._id, loadCoops]);

  const setCurrentCoop = (coop) => {
    setCurrentCoopState(coop);
    localStorage.setItem('agrix_coop', JSON.stringify(coop));
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

  const register = async (userData) => {
    const res = await client.post('/users', userData);
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
    localStorage.removeItem('agrix_coop');
    delete client.defaults.headers.common['Authorization'];
    setUser(null);
    setCoops([]);
    setCurrentCoopState(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, coops, currentCoop, setCurrentCoop, loading, login, register, logout, loadCoops }}
    >
      {children}
    </AuthContext.Provider>
  );
};
