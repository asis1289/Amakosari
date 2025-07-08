'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from 'lucide-react'
import Image from 'next/image'
import { useUser } from '../../UserContext'

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'Login failed');
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-orange-50 via-rose-50 to-red-100">
      {/* Left: Brand Image - fully responsive, with gradient and shadow */}
      <div className="relative w-full md:w-1/2 h-64 md:h-screen flex-shrink-0 overflow-hidden shadow-2xl md:rounded-r-3xl bg-gradient-to-br from-orange-200/60 via-rose-100/60 to-red-200/60">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/30 to-orange-900/10 pointer-events-none" />
        <Image 
          src="/images/login.jpeg" 
          alt="Brand" 
          fill 
          className="object-cover object-center w-full h-full transition-all duration-500" 
          priority 
        />
      </div>
      {/* Right: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-0 bg-gradient-to-br from-orange-50/80 to-red-50/80">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:my-12 flex flex-col gap-6 border border-orange-100">
          <h2 className="text-2xl font-bold text-center text-orange-900 mb-2 tracking-tight">Sign in to your account</h2>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Image src="/images/logoshop.png" alt="आमाको Saaरी Logo" width={56} height={56} className="w-14 h-14 object-contain" />
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">आमाको Saaरी</h1>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-md">
              हाम्रो पहिरन, हाम्रो पहिचान!
            </p>
          </div>
          <div className="backdrop-blur-2xl bg-white/60 rounded-3xl p-10 border border-white/30 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-orange-600 hover:to-red-700 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/70 text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm bg-white/50 text-sm font-medium text-gray-700 hover:bg-white/70 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm bg-white/50 text-sm font-medium text-gray-700 hover:bg-white/70 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>

            <div className="text-center mt-8 text-gray-600">
              <p>
                Don't have an account?{' '}
                <Link href="/register" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
        {/* Minimal Footer with important links */}
        <footer className="w-full max-w-md mt-8 text-center text-sm text-gray-500 flex flex-col gap-2">
          <a href="/forgot-password" className="hover:underline text-orange-700">Forgot Password?</a>
          <a href="/" className="hover:underline">Back to Home</a>
          <a href="/contact" className="hover:underline text-orange-700">Contact Support</a>
        </footer>
      </div>
    </div>
  );
} 