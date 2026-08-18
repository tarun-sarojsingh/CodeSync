import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  username: string | null;
  userId: string | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('codesync_token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('codesync_username'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('codesync_userId'));

  useEffect(() => {
    if (token) localStorage.setItem('codesync_token', token);
    else localStorage.removeItem('codesync_token');
    
    if (username) localStorage.setItem('codesync_username', username);
    else localStorage.removeItem('codesync_username');
    
    if (userId) localStorage.setItem('codesync_userId', userId);
    else localStorage.removeItem('codesync_userId');
  }, [token, username, userId]);

  const login = async (loginUsername: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUsername(data.username);
        setUserId(data.userId);
      } else {
        throw new Error('Login failed');
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
