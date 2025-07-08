'use client';

import { useState, useEffect } from 'react';

export default function DebugAuth() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('Token from localStorage:', token);
      console.log('User from localStorage:', user);

      if (!token) {
        setAuthInfo({ error: 'No token found' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Auth response status:', response.status);
      
      const data = await response.json();
      console.log('Auth response data:', data);

      setAuthInfo({
        token: token ? `${token.substring(0, 20)}...` : 'No token',
        userFromStorage: user ? JSON.parse(user) : null,
        authResponse: data,
        responseStatus: response.status
      });
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(authInfo, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="space-y-2">
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Auth & Reload
          </button>
          <button 
            onClick={checkAuth}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
          >
            Recheck Auth
          </button>
        </div>
      </div>
    </div>
  );
} 