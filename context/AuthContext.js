import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'user']).then(pairs => {
      const t = pairs[0][1];
      const u = pairs[1][1];
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      // Check local storage users
      const stored = await AsyncStorage.getItem('users');
      const users = stored ? JSON.parse(stored) : [];
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) throw new Error('Invalid email or password');
      const fakeToken = 'tok_' + Date.now();
      setToken(fakeToken); setUser(found);
      await AsyncStorage.setItem('token', fakeToken);
      await AsyncStorage.setItem('user', JSON.stringify(found));
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const signup = async (name, email, password) => {
    try {
      const stored = await AsyncStorage.getItem('users');
      const users = stored ? JSON.parse(stored) : [];
      if (users.find(u => u.email === email)) throw new Error('Email already registered');
      const newUser = { id: Date.now().toString(), name, email, password };
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      const fakeToken = 'tok_' + Date.now();
      setToken(fakeToken); setUser(newUser);
      await AsyncStorage.setItem('token', fakeToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const updateProfile = async (updates) => {
    try {
      const stored = await AsyncStorage.getItem('users');
      const users = stored ? JSON.parse(stored) : [];
      const idx = users.findIndex(u => u.id === user.id);
      if (idx === -1) throw new Error('User not found');
      users[idx] = { ...users[idx], ...updates };
      await AsyncStorage.setItem('users', JSON.stringify(users));
      const updated = users[idx];
      setUser(updated);
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const stored = await AsyncStorage.getItem('users');
      const users = stored ? JSON.parse(stored) : [];
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) throw new Error('No account found with this email');
      users[idx].password = newPassword;
      await AsyncStorage.setItem('users', JSON.stringify(users));
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const logout = async () => {
    setToken(null); setUser(null);
    await AsyncStorage.multiRemove(['token', 'user']);
    // Keep splash_seen so it doesn't show again after logout
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateProfile, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
