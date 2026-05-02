import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [coops, setCoops] = useState([]);
  const [currentCoop, setCurrentCoopState] = useState(null);
  const [pendingCoops, setPendingCoops] = useState([]);
  const [loading, setLoading] = useState(true);

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
      value={{ user, coops, pendingCoops, currentCoop, setCurrentCoop, loading, login, register, logout, loadCoops }}
    >
      {children}
    </AuthContext.Provider>
  );
};
