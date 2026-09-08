import { createContext, useContext, useState, type ReactNode } from 'react';
import { getToken, setToken as saveToken, clearToken } from '../lib/authStorage';
import type { LoginResponse } from '../api/auth';

interface AuthContextValue {
  admin: LoginResponse['admin'] | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<LoginResponse['admin'] | null>(() => {
    const stored = localStorage.getItem('schedulemate_admin');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (data: LoginResponse) => {
    saveToken(data.accessToken);
    localStorage.setItem('schedulemate_admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem('schedulemate_admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!getToken(), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}