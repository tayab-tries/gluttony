import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from './mockData';

const AuthDemoContext = createContext(null);

export function AuthDemoProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('crave_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = (email, password) => {
    const user = DEMO_USERS[email];
    if (user && user.password === password) {
      const userData = { email, role: user.role, full_name: user.full_name };
      setCurrentUser(userData);
      localStorage.setItem('crave_user', JSON.stringify(userData));
      return { success: true, role: user.role };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('crave_user');
  };

  return (
    <AuthDemoContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthDemoContext.Provider>
  );
}

export const useAuthDemo = () => useContext(AuthDemoContext);