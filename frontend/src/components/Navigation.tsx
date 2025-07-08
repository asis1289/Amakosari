'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Search, User, Menu, X, Heart, ChevronDown, Sparkles, Bell, Mail } from 'lucide-react'
import Profile from './Profile'
import { useUser } from '../UserContext'
import { io } from 'socket.io-client'
import { useCart } from './CartContext'
import { useWishlist } from './WishlistContext'

interface Category {
  id: string
  name: string
  slug: string
  parentCategory?: string
}

interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
}

interface Notification {
  id: number;
  message: string;
  link: string;
  time: string;
}

function NavigationContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [under50Products, setUnder50Products] = useState<Product[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use global user context
  const { user, setUser, logout, loading } = useUser();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  useEffect(() => {
    // Check if we have cached data first
    const cachedCategories = localStorage.getItem('cachedCategories')
    const cachedUnder50 = localStorage.getItem('cachedUnder50')
    const cacheTime = localStorage.getItem('cacheTime')
    const now = Date.now()
    // Cache expires after 5 minutes
    const cacheValid = cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000
    if (cachedCategories && cacheValid) {
      setCategories(JSON.parse(cachedCategories))
    } else {
      fetch('http://localhost:3001/api/categories')
        .then(res => res.json())
        .then(data => {
          const categoriesData = data.categories || []
          setCategories(categoriesData)
          localStorage.setItem('cachedCategories', JSON.stringify(categoriesData))
          localStorage.setItem('cacheTime', now.toString())
        })
        .catch(err => console.error('Error fetching categories:', err))
    }
    if (cachedUnder50 && cacheValid) {
      setUnder50Products(JSON.parse(cachedUnder50))
    } else {
      fetch('http://localhost:3001/api/products/under-50')
        .then(res => res.json())
        .then(data => {
          const productsData = data || []
          setUnder50Products(productsData)
          localStorage.setItem('cachedUnder50', JSON.stringify(productsData))
        })
        .catch(err => console.error('Error fetching products under $50:', err))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    let socket = io('http://localhost:3001', { transports: ['websocket'] });
    socket.on('new-inquiry', (inquiry) => {
      if (audioRef.current) audioRef.current.play();
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: 'You have a new enquiry — check',
          link: '/admin/inquiries',
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4)
      ]);
      setHasUnreadNotification(true);
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  }

  // Add a function to fetch the latest user profile from the backend
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // When opening the profile modal, fetch the latest user profile
  const handleOpenProfile = () => {
    fetchUserProfile();
    setIsProfileOpen(true);
  };

  // Defensive check for user role
  const getDashboardLink = () => {
    if (!user || !user.role) return null;
    if (user.role === 'ADMIN') {
      return (
        <Link 
          href="/admin/dashboard" 
          className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Admin Dashboard
        </Link>
      );
    } else if (user.role === 'CUSTOMER') {
      return (
        <Link 
          href="/dashboard" 
          className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          My Dashboard
        </Link>
      );
    }
    return null;
  };

  // Don't render dropdowns until data is loaded to prevent hydration mismatch
  const renderDropdown = (parentCategory: string, title: string, viewAllText: string) => {
    if (!isLoaded) return null
    
    const filteredCategories = categories.filter(cat => cat.parentCategory === parentCategory)
    
    return (
      <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top z-50">
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
          <div className="space-y-2">
            {filteredCategories.map(category => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="block text-gray-600 hover:text-orange-600 transition-colors py-1"
              >
                {category.name}
              </Link>
            ))}
            <Link href={`/categories/${parentCategory}`} className="block text-orange-600 hover:text-orange-700 font-medium py-1">
              {viewAllText}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleBellClick = () => {
    setDropdownOpen((open) => !open);
    setHasUnreadNotification(false);
  };

  const handleNotificationClick = (link: string) => {
    setDropdownOpen(false);
    setHasUnreadNotification(false);
    window.location.href = link;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group pr-8">
              {/* Logo */}
              <div className="relative w-12 h-12">
                <Image 
                  src="/images/logoshop.png" 
                  alt="आमाको Saaरी Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                  quality={95}
                  onError={(e) => {
                    // Fallback to a gradient background if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <span class="text-white font-bold text-lg">आ</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              <div className="flex flex-col pl-2">
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 whitespace-nowrap">
                  आमाको Saaरी
                </h1>
                <p className="text-sm font-semibold" style={{
                  background: 'linear-gradient(90deg, #ff9800, #e91e63, #3f51b5, #009688)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '0.5px',
                }}>
                  हाम्रो पहिरन, हाम्रो पहिचान!
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 ml-8">
            {/* WOMEN */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                <span className="font-medium">WOMEN</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {renderDropdown('women', "Women's Collection", "View All Women's →")}
            </div>

            {/* MEN */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                <span className="font-medium">MEN</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {renderDropdown('men', "Men's Collection", "View All Men's →")}
            </div>

            {/* KIDS */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                <span className="font-medium">KIDS</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {renderDropdown('kids', "Kids Collection", "View All Kids' →")}
            </div>

            {/* JEWELLERY */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                <span className="font-medium">JEWELLERY</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {renderDropdown('jewellery', "Jewellery Collection", "View All Jewellery →")}
            </div>

            {/* ACCESSORIES */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                <span className="font-medium">ACCESSORIES</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {renderDropdown('accessories', "Accessories Collection", "View All Accessories →")}
            </div>

            {/* UNDER $50 */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                <span className="font-medium">UNDER $50</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isLoaded && (
                <div className="absolute top-full left-0 w-80 bg-white shadow-xl rounded-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Budget-Friendly Collection</h3>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {under50Products.slice(0, 6).map(product => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded overflow-hidden">
                            <Image
                              src={product.imageUrl || '/images/placeholder-product.jpg'}
                              alt={product.name}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">{product.name}</p>
                            <p className="text-xs text-orange-600 font-medium">${product.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link href="/products/under-50" className="block text-orange-600 hover:text-orange-700 font-medium py-1 text-center border-t pt-2">
                      View All Under $50 →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* SHOP */}
            <Link href="/shop" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              SHOP
            </Link>

            {/* CONTACT US */}
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              CONTACT US
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-700 hover:text-orange-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="text-gray-700 hover:text-orange-600 transition-colors relative">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="count-badge absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="text-gray-700 hover:text-orange-600 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="count-badge absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-orange-600 transition-colors flex items-center">
                <User className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full w-48 bg-white shadow-xl rounded-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 mt-2 z-50">
                <div className="p-2">
                  {user ? (
                    <>
                      <button
                        onClick={handleOpenProfile}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Profile
                      </button>
                      {getDashboardLink()}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/register" 
                        className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-orange-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {user && user.role === 'ADMIN' && (
              <div className="relative">
                <button
                  className="relative p-2 rounded-full hover:bg-blue-50 focus:outline-none"
                  onClick={handleBellClick}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-blue-600" />
                  {hasUnreadNotification && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <span className="font-semibold text-gray-700">Notifications</span>
                      <button onClick={() => setDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <li className="px-4 py-4 text-gray-500 text-center">No notifications</li>
                      ) : (
                        notifications.map((notif) => (
                          <li
                            key={notif.id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center space-x-3"
                            onClick={() => handleNotificationClick(notif.link)}
                          >
                            <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div>
                              <div className="text-sm text-gray-800">{notif.message}</div>
                              <div className="text-xs text-gray-400">{notif.time}</div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3">Categories</h3>
                <Link 
                  href="/categories/women" 
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Women
                </Link>
                <Link 
                  href="/categories/men" 
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Men
                </Link>
                <Link 
                  href="/categories/kids" 
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kids
                </Link>
                <Link 
                  href="/categories/jewellery" 
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Jewellery
                </Link>
                <Link 
                  href="/categories/accessories" 
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accessories
                </Link>
                <Link 
                  href="/products/under-50" 
                  className="block px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Under $50
                </Link>
              </div>
              <div className="pt-4 border-t border-gray-200">
                {/* Mobile Wishlist and Cart Links */}
                <div className="flex gap-2 mb-3">
                  <Link 
                    href="/wishlist" 
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist
                    {wishlist.length > 0 && (
                      <span className="count-badge bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                  <Link 
                    href="/cart" 
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                    {cartCount > 0 && (
                      <span className="count-badge bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
                <Link 
                  href="/contact" 
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Link>
                {user ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        handleOpenProfile()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Profile
                    </button>
                    {getDashboardLink()}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Profile Modal */}
      {isProfileOpen && (
        <Profile 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)}
          user={
            user
              ? {
                  ...user,
                  phone: user.phone ?? "",
                  dateOfBirth: user.dateOfBirth ?? "",
                  createdAt: user.createdAt ?? "",
                }
              : null
          }
          onUserUpdate={handleProfileUpdate}
          onProfileRefresh={fetchUserProfile}
        />
      )}
    </nav>
  )
}

export default function Navigation() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Return a minimal version for SSR to prevent hydration mismatch
    return (
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 group pr-8">
                <div className="relative w-12 h-12">
                  <Image 
                    src="/images/logoshop.png" 
                    alt="आमाको Saaरी Logo" 
                    width={48} 
                    height={48} 
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    priority
                    quality={95}
                    onError={(e) => {
                      // Fallback to a gradient background if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-lg">आ</span>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col pl-2">
                  <h1 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 whitespace-nowrap">
                    आमाको Saaरी
                  </h1>
                  <p className="text-sm font-semibold" style={{
                    background: 'linear-gradient(90deg, #ff9800, #e91e63, #3f51b5, #009688)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                    letterSpacing: '0.5px',
                  }}>
                    हाम्रो पहिरन, हाम्रो पहिचान!
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Static version */}
            <div className="hidden lg:flex items-center space-x-8 ml-8">
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                  <span className="font-medium">WOMEN</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                  <span className="font-medium">MEN</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                  <span className="font-medium">KIDS</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                  <span className="font-medium">JEWELLERY</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                  <span className="font-medium">ACCESSORIES</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors py-2">
                  <span className="font-medium">UNDER $50</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <Link href="/shop" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                SHOP
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                CONTACT US
              </Link>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-orange-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/wishlist" className="text-gray-700 hover:text-orange-600 transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-orange-600 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="count-badge absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <button className="text-gray-700 hover:text-orange-600 transition-colors flex items-center">
                <User className="w-5 h-5" />
              </button>
              <button className="lg:hidden text-gray-700 hover:text-orange-600 transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return <NavigationContent />
} 