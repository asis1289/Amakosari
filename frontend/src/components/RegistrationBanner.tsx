'use client';

import { useState, useEffect } from 'react';
import { X, Gift, Star, Truck, Shield } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '../UserContext';

export default function RegistrationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    // Don't show banner if still loading or if user is logged in (any role) or if it was hidden recently
    if (loading || user) {
      setIsVisible(false);
      return;
    }

    // Check if banner was hidden recently
    const hiddenTime = localStorage.getItem('bannerHidden');
    if (hiddenTime) {
      const timeDiff = Date.now() - parseInt(hiddenTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        setIsVisible(false);
        return;
      }
    }

    // Show banner for guest users after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleClose = () => {
    setIsVisible(false);
    // Hide for 24 hours
    localStorage.setItem('bannerHidden', Date.now().toString());
  };

  const handleRegister = () => {
    setIsVisible(false);
    // Hide for 24 hours after clicking register
    localStorage.setItem('bannerHidden', Date.now().toString());
  };

  // Don't show banner if still loading, user is logged in, or banner is not visible
  if (loading || user || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white shadow-lg transform transition-transform duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Special Offers!</span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>Exclusive Discounts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="w-4 h-4" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Secure Shopping</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/register"
              onClick={handleRegister}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
            >
              Register Now
            </Link>
            <button
              onClick={handleClose}
              className="text-white hover:text-orange-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile version */}
        <div className="md:hidden mt-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>Exclusive Discounts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="w-4 h-4" />
                <span>Free Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 