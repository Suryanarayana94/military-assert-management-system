import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sentinel-session') || 'null'); } catch { return null; }
  });
  const login = async (credentials) => {
    const next = await api.login(credentials);
    localStorage.setItem('sentinel-token', next.token);
    localStorage.setItem('sentinel-session', JSON.stringify(next));
    setSession(next);
  };
  const logout = () => { localStorage.removeItem('sentinel-token'); localStorage.removeItem('sentinel-session'); setSession(null); };
  const value = useMemo(() => ({ ...session, user: session?.user, login, logout }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
