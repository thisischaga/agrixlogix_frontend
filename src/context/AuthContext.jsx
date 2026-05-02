import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [coops, setCoops] = useState([]);
  const [currentCoop, setCurrentCoopState] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCoops = useCallback(async (userData) => {
    try {
      const res = await client.get('/me/coops');
      const fetchedCoops = res.data?.memberCoops || [];
      setCoops(fetchedCoops);
      
      if (fetchedCoops.length > 0) {
        setCurrentCoopState(fetchedCoops[0]);
      } else if (userData) {
        // Auto-create a coop if none exist (Web logic)
        try {
          const newCoopRes = await client.post('/cooperatives', {
            name: `Coopérative de ${userData.name.split(' ')[0]}`,
            location: 'Togo',
            cropType: 'Maïs'
          });
          setCurrentCoopState(newCoopRes.data);
          setCoops([newCoopRes.data]);
        } catch (e) {
          console.error('Auto-creation failed:', e);
        }
      }
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
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        loadCoops(parsedUser);
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
    await loadCoops(userData);
    return userData;
  };

  const register = async (regData) => {
    const res = await client.post('/users', regData);
    const { token, ...newUser } = res.data;
    localStorage.setItem('agrix_token', token);
    localStorage.setItem('agrix_user', JSON.stringify(newUser));
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(newUser);
    await loadCoops(newUser);
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
      value={{ user, coops, currentCoop, setCurrentCoop, loading, login, register, logout, loadCoops }}
    >
      {children}
    </AuthContext.Provider>
  );
};
