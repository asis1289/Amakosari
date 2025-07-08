'use client';

import { useState } from 'react';
import Link from 'next/link';
import PhoneInput from '../../components/PhoneInput';
import Image from 'next/image';

export default function AdminRegister() {
  const [step, setStep] = useState<'access' | 'form'>('access');
  const [accessKey, setAccessKey] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    accessKey: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accessKeyVerified, setAccessKeyVerified] = useState(false);
  const [accessKeyError, setAccessKeyError] = useState('');

  const handleAccessKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-access-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey: accessKey })
      });
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setStep('form');
        setError('');
      } else {
        setError(data.message || 'Invalid access key');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/admin-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          accessKey: accessKey
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setError('');
        // Do NOT auto-login or redirect
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const verifyAccessKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessKeyError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-access-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey: formData.accessKey })
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setAccessKeyVerified(true);
        setAccessKeyError('');
      } else {
        setAccessKeyError('Invalid access key. Please try again.');
      }
    } catch (err) {
      setAccessKeyError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-orange-50 via-rose-50 to-red-100">
      {/* Left: Brand Image - fully responsive, with gradient and shadow */}
      <div className="relative w-full md:w-1/2 h-64 md:h-screen flex-shrink-0 overflow-hidden shadow-2xl md:rounded-r-3xl bg-gradient-to-br from-orange-200/60 via-rose-100/60 to-red-200/60">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/30 to-orange-900/10" />
        <Image src="/images/login.jpeg" alt="Brand" fill className="object-contain z-0" priority />
      </div>
      {/* Right: Admin Register Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-0 min-h-screen">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mt-8 mb-4 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Registration</h2>
          {/* Access Key Step */}
          {!accessKeyVerified && (
            <form onSubmit={verifyAccessKey} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="accessKey" className="text-sm font-semibold text-gray-800">Admin Access Key</label>
                <input
                  type="password"
                  id="accessKey"
                  value={formData.accessKey}
                  onChange={e => setFormData({ ...formData, accessKey: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white/90"
                  required
                />
                {accessKeyError && <span className="text-red-500 text-xs mt-1">{accessKeyError}</span>}
              </div>
              <button type="submit" className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold shadow hover:from-orange-500 hover:to-red-500 transition">Verify Access Key</button>
            </form>
          )}
          {/* Main Registration Form */}
          {accessKeyVerified && (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="firstName" className="text-sm font-semibold text-gray-800">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white/90"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="lastName" className="text-sm font-semibold text-gray-800">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white/90"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-800">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white/90"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-800">Phone Number</label>
                <div className="w-full">
                  <PhoneInput value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} required />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-800">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white/90"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-800">Password</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white/90"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-800">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white/90"
                  required
                />
              </div>
              {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
              <button type="submit" className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold shadow hover:from-orange-500 hover:to-red-500 transition disabled:opacity-60" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
              {success && (
                <div className="text-green-600 text-center font-semibold mt-2">
                  Registration successful! <Link href="/login" className="underline text-orange-600 hover:text-red-600 ml-1">Login here</Link>
                </div>
              )}
            </form>
          )}
        </div>
        {/* Footer with important links */}
        <footer className="w-full max-w-md mx-auto flex flex-col md:flex-row items-center justify-between gap-2 px-8 pb-6 text-sm text-gray-700">
          <Link href="/" className="hover:underline hover:text-orange-600">Back to Home</Link>
          <Link href="/contact" className="hover:underline hover:text-orange-600">Contact Support</Link>
        </footer>
      </div>
    </div>
  );
} 