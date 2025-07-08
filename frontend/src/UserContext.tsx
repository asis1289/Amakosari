"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User type can be expanded as needed
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt?: string;
  [key: string]: any;
} | null;

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Verify token and load user from backend
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserState(data.user);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUserState(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUserState(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const setUser = (u: User) => {
    setUserState(u);
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}; 