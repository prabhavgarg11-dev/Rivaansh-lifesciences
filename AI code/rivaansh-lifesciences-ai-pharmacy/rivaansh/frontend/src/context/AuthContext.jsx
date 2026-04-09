import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]    = useState(null);
  const [token, setToken]   = useState(() => localStorage.getItem('userToken'));
  const [loading, setLoading] = useState(true);

  const saveToken = (t) => {
    setToken(t);
    localStorage.setItem('userToken', t);
  };

  const clearToken = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
  }, []);

  // Auto-login on mount
  useEffect(() => {
    const init = async () => {
      const t = localStorage.getItem('userToken');
      if (!t) { setLoading(false); return; }

      // Client-side JWT expiry check
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) { clearToken(); setLoading(false); return; }

        const stored = JSON.parse(localStorage.getItem('userInfo') || 'null');
        if (stored) {
          setUser(stored);
        } else {
          // Verify with server
          const { ok, data } = await api.get('/auth/me');
          if (ok) { setUser(data); localStorage.setItem('userInfo', JSON.stringify(data)); }
          else clearToken();
        }
      } catch { clearToken(); }
      setLoading(false);
    };
    init();
  }, [clearToken]);

  // Handle auth:expired from api.js
  useEffect(() => {
    const handler = () => clearToken();
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [clearToken]);

  const login = async (email, password) => {
    const { ok, data } = await api.post('/auth/login', { email, password });
    if (ok && data.token) {
      saveToken(data.token);
      const u = { _id: data._id, name: data.name, email: data.email, isAdmin: data.isAdmin };
      setUser(u);
      localStorage.setItem('userInfo', JSON.stringify(u));
      return { ok: true, user: u };
    }
    return { ok: false, message: data.message || 'Login failed.' };
  };

  const register = async (name, email, phone, password) => {
    const { ok, data } = await api.post('/auth/register', { name, email, phone, password });
    if (ok && data.token) {
      saveToken(data.token);
      const u = { _id: data._id, name: data.name, email: data.email, isAdmin: data.isAdmin };
      setUser(u);
      localStorage.setItem('userInfo', JSON.stringify(u));
      return { ok: true, user: u };
    }
    return { ok: false, message: data.message || 'Registration failed.' };
  };

  const logout = () => {
    clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
