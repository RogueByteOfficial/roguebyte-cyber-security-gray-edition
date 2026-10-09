import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../shared/types.ts';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../api.ts';
import { translations, Language } from '../i18n.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  language: Language;
  t: typeof translations['en'];
  setLanguage: (lang: Language) => void;
  login: (credentials: { emailOrUsername: string; password: string }) => Promise<void>;
  register: (data: { email: string; username: string; password: string; role?: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('roguebyte_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('roguebyte_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { emailOrUsername: string; password: string }) => {
    const res = await api.login(credentials);
    setStoredToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { email: string; username: string; password: string; role?: UserRole }) => {
    const res = await api.register(data);
    setStoredToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    clearStoredToken();
    setUser(null);
  };

  const quickDemoLogin = async (role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    let email = '';
    let password = '';
    if (role === 'ADMIN') {
      email = 'admin@roguebyte.local';
      password = 'AdminSidoDev2026!';
    } else if (role === 'INSTRUCTOR') {
      email = 'instructor@roguebyte.local';
      password = 'InstructorPass2026!';
    } else {
      email = 'student@roguebyte.local';
      password = 'StudentPass2026!';
    }
    await login({ emailOrUsername: email, password });
  };

  const t = translations[language];

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      language,
      t,
      setLanguage,
      login,
      register,
      logout,
      quickDemoLogin,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
