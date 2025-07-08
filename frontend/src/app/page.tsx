'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ShoppingBag, Star, Heart, Eye, ArrowRight, ArrowLeft, Sparkles, Crown, Shield, Users, Award } from 'lucide-react'
import RegistrationBanner from '@/components/RegistrationBanner'
import ProductCard from '../components/ProductCard'
import Image from 'next/image'
import { useUser } from '../UserContext'
import { io } from 'socket.io-client'
import { toast } from 'react-hot-toast'
import WishlistSuccessNotification from '../components/WishlistSuccessNotification'
import SectionWith3DImage from "./components/SectionWith3DImage"
import Floating3DImageOverlay from "./components/Floating3DImageOverlay"
import Blurry3DImageBackground from "./components/Blurry3DImageBackground"

// Intersection Observer Hook for scroll animations
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasIntersected) {
        setIsIntersecting(true)
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [hasIntersected, options])

  return [ref, isIntersecting] as [React.RefObject<HTMLDivElement>, boolean]
}

// Animated Section Component
function AnimatedSection({ children, className = "", delay = 0, direction = "up" }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const [ref, isIntersecting] = useIntersectionObserver()
  
  const getTransform = () => {
    switch (direction) {
      case "up": return "translateY(60px)"
      case "down": return "translateY(-60px)"
      case "left": return "translateX(60px)"
      case "right": return "translateX(-60px)"
      default: return "translateY(60px)"
    }
  }

  const getAnimation = () => {
    switch (direction) {
      case "up": return "morph-in"
      case "left": return "morph-slide-left"
      case "right": return "morph-slide-right"
      default: return "morph-in"
    }
  }

  return (
    <div
      ref={ref}
      className={`section-morph ${className}`}
      style={{
        opacity: isIntersecting ? 1 : 0,
        transform: isIntersecting ? 'translateY(0) scale(1)' : `${getTransform()} scale(0.9)`,
        filter: isIntersecting ? 'blur(0px)' : 'blur(10px)',
        animation: isIntersecting ? `${getAnimation()} 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards` : 'none',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: '1.2s',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// New Arrivals Products Component
function NewArrivalsProducts({ user, onAddToCart, onAddToWishlist, wishlistItems }: {
  user: any;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  wishlistItems: string[];
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products/new-arrivals')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.slice(0, 4)) // Show only 4 products
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNewArrivals()
    // Real-time updates
    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socket.on('product-updated', () => {
      fetchNewArrivals()
    })
    return () => { socket.disconnect() }
  }, [])

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          variant="default"
          showActions={true}
          user={user}
        />
      ))}
    </div>
  )
}

// 1. Pool of icon/image URLs (use product images as fallback icons)
const collectionIcons = [
  '/images/products/bindi-set-1.jpg',
  '/images/products/earrings-1.jpg',
  '/images/products/bangles-1.jpg',
  '/images/products/kids-waistcoat-1.jpg',
  '/images/products/kids-kurta-1.jpg',
  '/images/logoshop.png',
  '/images/logo1.png',
];

// 2. Deterministic hash function to map collection name to icon index
function getIconIndex(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % collectionIcons.length;
}

// Define type for collection
interface Collection {
  id: string;
  name: string;
  description?: string;
  imageUrl: string; // Backend always provides this (either uploaded or default generated)
  [key: string]: any;
}

// Enhanced 3D/morph effect for hero image (no scroll fade/move)
function HeroImage3DEffect({ imageUrl }: { imageUrl: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    let tiltX = 0, tiltY = 0, zoom = 1
    const handleMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect()
      const x = (e.clientX - left) / width - 0.5
      const y = (e.clientY - top) / height - 0.5
      tiltX = -y * 10
      tiltY = x * 10
      zoom = 1.04
      el.style.transform = `scale(${zoom}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    }
    const handleLeave = () => {
      tiltX = 0
      tiltY = 0
      zoom = 1
      el.style.transform = ''
    }
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [])
  return (
    <div
      ref={ref}
      className="absolute inset-0 z-0 pointer-events-auto transition-transform duration-500 will-change-transform"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(1.08) saturate(1.1)',
        borderRadius: '0',
        transition: 'transform 0.7s cubic-bezier(.4,2,.3,1)',
      }}
      aria-label="Hero background image"
    />
  )
}

// Men's Wear Products Component
function MensWearProducts({ user, onAddToCart, onAddToWishlist, wishlistItems }: {
  user: any;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  wishlistItems: string[];
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMensProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories/men/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products?.slice(0, 8) || []) // Show only 8 products
        }
      } catch (error) {
        console.error('Error fetching men\'s products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMensProducts()
    // Real-time updates
    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socket.on('product-updated', () => {
      fetchMensProducts()
    })
    return () => { socket.disconnect() }
  }, [])

  if (loading) {
    return (
      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="flex-shrink-0 w-64 group relative overflow-hidden rounded-2xl bg-white shadow-lg animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          variant="compact"
          showActions={true}
          user={user}
        />
      ))}
    </div>
  )
}

// Women's Wear Products Component
function WomensWearProducts({ user, onAddToCart, onAddToWishlist, wishlistItems }: {
  user: any;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  wishlistItems: string[];
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWomensProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories/women/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products?.slice(0, 8) || []) // Show only 8 products
        }
      } catch (error) {
        console.error('Error fetching women\'s products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWomensProducts()
    // Real-time updates
    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socket.on('product-updated', () => {
      fetchWomensProducts()
    })
    return () => { socket.disconnect() }
  }, [])

  if (loading) {
    return (
      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="flex-shrink-0 w-64 group relative overflow-hidden rounded-2xl bg-white shadow-lg animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          variant="compact"
          showActions={true}
          user={user}
        />
      ))}
    </div>
  )
}

// Kids Wear Products Component
function KidsWearProducts({ user, onAddToCart, onAddToWishlist, wishlistItems }: {
  user: any;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  wishlistItems: string[];
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKidsProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories/kids/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products?.slice(0, 8) || []) // Show only 8 products
        }
      } catch (error) {
        console.error('Error fetching kids products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchKidsProducts()
    // Real-time updates
    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socket.on('product-updated', () => {
      fetchKidsProducts()
    })
    return () => { socket.disconnect() }
  }, [])

  if (loading) {
    return (
      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="flex-shrink-0 w-64 group relative overflow-hidden rounded-2xl bg-white shadow-lg animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          variant="compact"
          showActions={true}
          user={user}
        />
      ))}
    </div>
  )
}

// Jewellery Products Component
function JewelleryProducts({ user, onAddToCart, onAddToWishlist, wishlistItems }: {
  user: any;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  wishlistItems: string[];
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJewelleryProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories/jewellery/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products?.slice(0, 8) || []) // Show only 8 products
        }
      } catch (error) {
        console.error('Error fetching jewellery products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchJewelleryProducts()
    // Real-time updates
    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socket.on('product-updated', () => {
      fetchJewelleryProducts()
    })
    return () => { socket.disconnect() }
  }, [])

  if (loading) {
    return (
      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="flex-shrink-0 w-64 group relative overflow-hidden rounded-2xl bg-white shadow-lg animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          variant="compact"
          showActions={true}
          user={user}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const { user } = useUser();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [sales, setSales] = useState<any[]>([])
  const [salesLoading, setSalesLoading] = useState(true)
  const [offers, setOffers] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [heroBackground, setHeroBackground] = useState<any>(null)
  const [heroLoading, setHeroLoading] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  
  // Settings state
  const [selectedOffers, setSelectedOffers] = useState<string[]>([])
  const [selectedSales, setSelectedSales] = useState<string[]>([])
  const [allOffers, setAllOffers] = useState<any[]>([])
  const [allSales, setAllSales] = useState<any[]>([])

  // Add cart and wishlist state
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [cartCount, setCartCount] = useState(0)

  // Add scroll state for hero morph transitions
  const [heroScrollY, setHeroScrollY] = useState(0)
  const heroRef = useRef<HTMLElement>(null)

  // Enhanced scroll handler for hero morph transitions
  const handleScroll = () => {
    const scrollY = window.scrollY
    setScrollProgress((scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
    
    // Calculate hero scroll progress for morph transitions
    if (heroRef.current) {
      const heroRect = heroRef.current.getBoundingClientRect()
      const heroHeight = heroRef.current.offsetHeight
      const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - heroRect.top) / (window.innerHeight + heroHeight)))
      setHeroScrollY(scrollProgress)
    }
  }

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Scroll progress effect
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch user data and wishlist
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token && user) {
          // Fetch wishlist items
          const wishlistResponse = await fetch('http://localhost:3001/api/wishlist', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (wishlistResponse.ok) {
            const wishlistData = await wishlistResponse.json()
            setWishlistItems(wishlistData.wishlistItems?.map((item: any) => item.product.id) || [])
          }

          // Fetch cart count
          const cartResponse = await fetch('http://localhost:3001/api/cart/count', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (cartResponse.ok) {
            const cartData = await cartResponse.json()
            setCartCount(cartData.count || 0)
          }
        } else {
          // Clear wishlist and cart count when no user
          setWishlistItems([])
          setCartCount(0)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Clear state on error
        setWishlistItems([])
        setCartCount(0)
      }
    }

    fetchUserData()
  }, [user]) // Add user as dependency

  // Listen for storage events to update cart and wishlist when items are added from other pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wishlistUpdated' && user) {
        // Refetch wishlist data
        const fetchWishlist = async () => {
          try {
            const token = localStorage.getItem('token')
            if (token) {
              const wishlistResponse = await fetch('http://localhost:3001/api/wishlist', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })

              if (wishlistResponse.ok) {
                const wishlistData = await wishlistResponse.json()
                setWishlistItems(wishlistData.wishlistItems?.map((item: any) => item.product.id) || [])
              }
            }
          } catch (error) {
            console.error('Error fetching wishlist:', error)
          }
        }
        fetchWishlist()
      }
      
      if (e.key === 'cartUpdated') {
        // Refetch cart count
        const fetchCartCount = async () => {
          try {
            const token = localStorage.getItem('token')
            if (token) {
              const cartResponse = await fetch('http://localhost:3001/api/cart/count', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })

              if (cartResponse.ok) {
                const cartData = await cartResponse.json()
                setCartCount(cartData.count || 0)
              }
            }
          } catch (error) {
            console.error('Error fetching cart count:', error)
          }
        }
        fetchCartCount()
      }
    }

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.type === 'wishlistUpdated' && user) {
        // Refetch wishlist data
        const fetchWishlist = async () => {
          try {
            const token = localStorage.getItem('token')
            if (token) {
              const wishlistResponse = await fetch('http://localhost:3001/api/wishlist', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })

              if (wishlistResponse.ok) {
                const wishlistData = await wishlistResponse.json()
                setWishlistItems(wishlistData.wishlistItems?.map((item: any) => item.product.id) || [])
              }
            }
          } catch (error) {
            console.error('Error fetching wishlist:', error)
          }
        }
        fetchWishlist()
      }
      
      if (e.type === 'cartUpdated') {
        // Refetch cart count
        const fetchCartCount = async () => {
          try {
            const token = localStorage.getItem('token')
            if (token) {
              const cartResponse = await fetch('http://localhost:3001/api/cart/count', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })

              if (cartResponse.ok) {
                const cartData = await cartResponse.json()
                setCartCount(cartData.count || 0)
              }
            }
          } catch (error) {
            console.error('Error fetching cart count:', error)
          }
        }
        fetchCartCount()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('wishlistUpdated', handleCustomStorageChange as EventListener)
    window.addEventListener('cartUpdated', handleCustomStorageChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('wishlistUpdated', handleCustomStorageChange as EventListener)
      window.removeEventListener('cartUpdated', handleCustomStorageChange as EventListener)
    }
  }, [user])

  // Cart functions
  const addToCart = async (productId: string) => {
    console.log('addToCart called with productId:', productId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity: 1 })
      })

      if (response.ok) {
        console.log('Product added to cart successfully')
        setCartCount(prev => prev + 1)
        localStorage.setItem('cartUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        const error = await response.json()
        console.error('Cart error response:', error)
      }
    } catch (error) {
      console.error('Cart error:', error)
    }
  }

  // Wishlist functions
  const toggleWishlist = async (productId: string) => {
    console.log('toggleWishlist called with productId:', productId, 'user:', user)
    if (!user) {
      console.log('No user, showing error')
      return
    }

    try {
      const isInWishlist = wishlistItems.includes(productId)
      const url = isInWishlist 
        ? `http://localhost:3001/api/wishlist/remove/${productId}`
        : `http://localhost:3001/api/wishlist/add/${productId}`
      
      const method = isInWishlist ? 'DELETE' : 'POST'
      
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (response.ok) {
        if (isInWishlist) {
          console.log('Product removed from wishlist')
          setWishlistItems(prev => prev.filter(id => id !== productId))
          triggerSuccessNotification('wishlist', 'remove')
        } else {
          console.log('Product added to wishlist')
          setWishlistItems(prev => [...prev, productId])
          triggerSuccessNotification('wishlist', 'add')
        }
        localStorage.setItem('wishlistUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('wishlistUpdated'))
      } else {
        console.error('Wishlist error response:', response.status)
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    }
  }

  // Fetch all sales and offers data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setSalesLoading(true)
        
        // Fetch all sales
        const salesResponse = await fetch('http://localhost:3001/api/sales')
        if (salesResponse.ok) {
          const salesData = await salesResponse.json()
          setAllSales(salesData)
        }
        
        // Fetch all offers
        const offersResponse = await fetch('http://localhost:3001/api/offers')
        if (offersResponse.ok) {
          const offersData = await offersResponse.json()
          setAllOffers(offersData.offers || [])
        }
        
        // Fetch settings for homepage (ignore 404 errors as settings might not be configured yet)
        try {
          const settingsResponse = await fetch('http://localhost:3001/settings/homepage-sales')
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json()
            setSelectedSales(settingsData.selectedSales || [])
          }
        } catch (error) {
          console.log('Settings not configured yet, using defaults')
        }
        
        try {
          const offersSettingsResponse = await fetch('http://localhost:3001/settings/homepage-offers')
          if (offersSettingsResponse.ok) {
            const offersSettingsData = await offersSettingsResponse.json()
            setSelectedOffers(offersSettingsData.selectedOffers || [])
          }
        } catch (error) {
          console.log('Settings not configured yet, using defaults')
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setSalesLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // Update offers when selected offers and sales change
  useEffect(() => {
    const newOffers = []
    
    // Add selected offers
    selectedOffers.forEach(offerId => {
      const offer = allOffers.find(o => o.id === offerId)
      if (offer && offer.isActive) {
        newOffers.push({
          title: offer.title,
          discount: offer.discount ? `${offer.discount}% OFF` : 'Special Offer',
          image: offer.imageUrl || "/images/wedding-offer.jpg",
          link: offer.link || `/offers/${offer.id}`,
          type: 'offer',
          description: offer.description
        })
      }
    })
    
    // Add selected sales
    selectedSales.forEach(saleId => {
      const sale = allSales.find(s => s.id === saleId)
      if (sale && sale.isActive) {
        newOffers.push({
          title: sale.name,
          discount: `${sale.discountPercent}% OFF`,
          image: "/images/wedding-offer.jpg",
          link: sale.collection ? `/collections/${sale.collection.id}` : `/sale`,
          type: 'sale',
          description: sale.description
        })
      }
    })
    
    // If no settings are configured, show all active sales and offers by default
    if (selectedOffers.length === 0 && selectedSales.length === 0) {
      // Add all active offers
      allOffers.forEach(offer => {
        if (offer.isActive) {
          newOffers.push({
            title: offer.title,
            discount: offer.discount ? `${offer.discount}% OFF` : 'Special Offer',
            image: offer.imageUrl || "/images/wedding-offer.jpg",
            link: offer.link || `/offers/${offer.id}`,
            type: 'offer',
            description: offer.description
          })
        }
      })
      
      // Add all active sales
      allSales.forEach(sale => {
        if (sale.isActive) {
          newOffers.push({
            title: sale.name,
            discount: `${sale.discountPercent}% OFF`,
            image: "/images/wedding-offer.jpg",
            link: sale.collection ? `/collections/${sale.collection.id}` : `/sale`,
            type: 'sale',
            description: sale.description
          })
        }
      })
    }
    
    // Add default offers if still no offers
    if (newOffers.length === 0) {
      newOffers.push({
        title: "New Arrivals",
        discount: "20% OFF",
        image: "/images/new-arrivals.jpg",
        link: "/new-arrivals",
        type: 'new-arrivals',
        description: "Fresh styles just in with exclusive discount!"
      })
    }
    
    console.log('Setting new offers:', newOffers.length, 'offers')
    console.log('Offers data:', newOffers)
    setOffers(newOffers)
  }, [selectedOffers, selectedSales, allOffers, allSales])

  // Add a small delay to ensure data is loaded
  const [isDataReady, setIsDataReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDataReady(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  console.log('Selected offers:', selectedOffers) // Debug log
  console.log('Selected sales:', selectedSales) // Debug log
  console.log('All offers:', allOffers.length) // Debug log
  console.log('All sales:', allSales.length) // Debug log
  console.log('Final offers:', offers.length) // Debug log
  console.log('Hero section render - heroBackground:', heroBackground) // Debug log
  console.log('Hero section render - imageUrl:', heroBackground?.imageUrl) // Debug log
  console.log('Hero section render - isDefault:', heroBackground?.isDefault) // Debug log

  // Force re-render when settings data changes
  useEffect(() => {
    console.log('Settings data changed - Selected offers:', selectedOffers.length, 'Selected sales:', selectedSales.length)
  }, [selectedOffers, selectedSales])

  const serviceReviews = [
    {
      icon: Shield,
      title: "PRICE GUARANTEE",
      description: "Seen cheaper? We match prices with any physical shop in Australia.",
      color: "text-blue-600"
    },
    {
      icon: ShoppingBag,
      title: "ONE STOP SHOP",
      description: "Extensive options for every celebration.",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "PERSONALIZED SERVICE",
      description: "Welcoming atmosphere, Knowledgeable staffs",
      color: "text-purple-600"
    },
    {
      icon: Award,
      title: "LOVED SINCE 2020",
      description: "Unmatched quality and customer service",
      color: "text-orange-600"
    }
  ]

  // Fetch collection data
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setCollectionsLoading(true)
        const response = await fetch('http://localhost:3001/api/collections')
        if (response.ok) {
          let data = await response.json()
          console.log('Collections data:', data) // Debug log
          // Only show 5 collections
          data = data.slice(0, 5)
          // Map to UI format
          const updatedCollections = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            imageUrl: c.imageUrl, // Backend always provides this (either uploaded or default generated)
            count: `${c.productCount || 0}+ Styles`,
            link: `/collections/${c.id}`,
          }))
          console.log('Updated collections:', updatedCollections) // Debug log
          setCollections(updatedCollections)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
      } finally {
        setCollectionsLoading(false)
      }
    }

    fetchCollections()
  }, [])

  // Fetch hero background
  useEffect(() => {
    const fetchHeroBackground = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/hero-background')
        if (response.ok) {
          const data = await response.json()
          console.log('Hero background data:', data)
          setHeroBackground(data.heroBackground)
        }
      } catch (error) {
        console.error('Error fetching hero background:', error)
      } finally {
        setHeroLoading(false)
      }
    }

    fetchHeroBackground()

    // Listen for live updates
    const socket = io('http://localhost:3001', { transports: ['websocket'] });
    socket.on('hero-background-updated', () => {
      fetchHeroBackground();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Auto-rotate offers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [offers.length])

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % serviceReviews.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [serviceReviews.length])

  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart')
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('')

  const triggerSuccessNotification = (type: 'cart' | 'wishlist', action: 'add' | 'remove' = 'add') => {
    setSuccessNotificationType(type)
    setSuccessNotificationMessage(
      type === 'cart'
        ? 'Product added to cart successfully!'
        : action === 'add'
          ? 'Product added to wishlist successfully!'
          : 'Product removed from wishlist successfully!'
    )
    setShowSuccessNotification(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <RegistrationBanner />
      {/* Welcome message */}
      <div className="w-full text-center py-4">
        {user ? (
          <h2 className="text-2xl font-bold text-orange-700 animate-fade-in-up">Welcome, {user.firstName}!</h2>
        ) : (
          <h2 className="text-2xl font-bold text-orange-700 animate-fade-in-up">Welcome to आमाको Saaरी!</h2>
        )}
      </div>
      {/* Hero Section with Morph Transitions */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden text-white min-h-[480px] flex items-center justify-center transition-all duration-700 ${
          heroBackground?.imageUrl && !heroBackground?.isDefault
            ? 'hero-image-mode' // new class for image mode
            : 'animated-gradient-bg' // default mode
        }`}
        style={
          heroBackground?.imageUrl && !heroBackground?.isDefault
            ? {
                background: 'none', // Remove gradient if image is set
              }
            : {}
        }
      >
        {/* 1. Uploaded image as 3D/parallax background (image mode) */}
        {heroBackground?.imageUrl && !heroBackground?.isDefault && (
          <HeroImage3DEffect imageUrl={heroBackground.imageUrl} />
        )}
        {/* 2. Animated Gradient Overlay (default mode) */}
        {(!heroBackground?.imageUrl || heroBackground?.isDefault) && (
          <div className="absolute inset-0 z-0 animated-gradient-bg pointer-events-none" aria-hidden="true"></div>
        )}
        
        {/* Glassmorphism Card and Content with Morph Transitions */}
        <div
          className={`relative z-10 max-w-2xl mx-auto px-8 py-12 rounded-3xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl glass-card transition-all duration-700 ease-out ${
            heroBackground?.imageUrl && !heroBackground?.isDefault 
              ? 'hero-content-image-mode' 
              : 'hero-content-default-mode'
          }`}
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)',
            backdropFilter: 'blur(18px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
            borderRadius: '2rem',
            position: 'relative',
            overflow: 'hidden',
            // Morph transitions based on scroll and image mode
            transform: heroBackground?.imageUrl && !heroBackground?.isDefault
              ? `translateY(${heroScrollY * 60}px) scale(${1 - heroScrollY * 0.1})`
              : `translateY(${heroScrollY * 20}px) scale(${1 - heroScrollY * 0.05})`,
            opacity: heroBackground?.imageUrl && !heroBackground?.isDefault
              ? 1 - heroScrollY * 0.3
              : 1 - heroScrollY * 0.1,
          }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
            background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)',
            opacity: 0.7,
            borderRadius: '2rem',
            zIndex: 1
          }} />
          <div className="relative z-10 text-center">
            <h1 
              className={`font-extrabold tracking-tight mb-4 drop-shadow-lg transition-all duration-700 ${
                heroBackground?.imageUrl && !heroBackground?.isDefault
                  ? 'text-4xl md:text-5xl' // Smaller when image is active
                  : 'text-5xl md:text-6xl' // Full size for default
              }`}
              style={{
                transform: heroBackground?.imageUrl && !heroBackground?.isDefault
                  ? `translateY(${heroScrollY * 30}px) scale(${1 - heroScrollY * 0.15})`
                  : `translateY(${heroScrollY * 10}px) scale(${1 - heroScrollY * 0.05})`,
              }}
            >
              <span className="inline-block text-white/90">आमाको</span>
              <span className="inline-block text-orange-400 ml-2">Saaरी</span>
            </h1>
            <p 
              className={`font-medium text-white/80 mb-8 transition-all duration-700 ${
                heroBackground?.imageUrl && !heroBackground?.isDefault
                  ? 'text-lg md:text-xl' // Smaller when image is active
                  : 'text-xl md:text-2xl' // Full size for default
              }`}
              style={{
                transform: heroBackground?.imageUrl && !heroBackground?.isDefault
                  ? `translateY(${heroScrollY * 20}px) scale(${1 - heroScrollY * 0.1})`
                  : `translateY(${heroScrollY * 5}px) scale(${1 - heroScrollY * 0.02})`,
                opacity: heroBackground?.imageUrl && !heroBackground?.isDefault
                  ? 1 - heroScrollY * 0.5
                  : 1 - heroScrollY * 0.2,
              }}
            >
              Discover authentic Nepali saaris and cultural dresses. Handcrafted for every woman, every occasion.
            </p>
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700"
              style={{
                transform: heroBackground?.imageUrl && !heroBackground?.isDefault
                  ? `translateY(${heroScrollY * 15}px) scale(${1 - heroScrollY * 0.08})`
                  : `translateY(${heroScrollY * 3}px) scale(${1 - heroScrollY * 0.01})`,
                opacity: heroBackground?.imageUrl && !heroBackground?.isDefault
                  ? 1 - heroScrollY * 0.7
                  : 1 - heroScrollY * 0.3,
              }}
            >
              <Link href="/products" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300">
                Shop Now
              </Link>
              <Link href="/about" className="bg-white/80 hover:bg-white/90 text-orange-700 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 backdrop-blur-md">
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        {/* Subtle zoom/shine overlay for image mode */}
        {heroBackground?.imageUrl && !heroBackground?.isDefault && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={{
            background: 'linear-gradient(120deg, rgba(255,94,0,0.18) 0%, rgba(255,0,128,0.10) 100%)',
            mixBlendMode: 'screen',
            filter: 'blur(2px) brightness(1.08) saturate(1.1)',
            transition: 'all 0.7s cubic-bezier(.4,2,.3,1)',
          }} />
        )}
      </section>

      {/* Best Selling Offers Section */}
      <section className="py-16 bg-white relative">
        <Blurry3DImageBackground src="/images/mygirlfont2.png" alt="Offers Font" side="right" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Current Best Selling <span className="text-orange-600">Offers</span>
            </h2>
            <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
              Don't miss out on these amazing deals!
            </p>
          </div>
          <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-orange-50">
            <div className="flex space-x-6 min-w-full pb-4">
              {salesLoading ? (
                // Loading skeleton for offers
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-80 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-2xl p-8 text-white text-center animate-pulse">
                    <div className="h-8 bg-white/20 rounded mb-2"></div>
                    <div className="h-12 bg-yellow-300/20 rounded mb-4"></div>
                    <div className="h-4 bg-white/20 rounded mb-6"></div>
                    <div className="h-10 bg-white/20 rounded"></div>
                  </div>
                ))
              ) : offers.length > 0 ? (
                offers.map((offer, index) => (
                  <div
                    key={offer.title + index}
                    className="flex-shrink-0 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 min-w-[300px] hover:transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="text-center">
                      <Sparkles className="w-8 h-8 text-yellow-300 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                      <p className="text-3xl font-bold text-yellow-300 mb-4">{offer.discount}</p>
                      <Link 
                        href={offer.type === 'new-arrivals' ? '/new-arrivals' : (offer.link || "/sale")}
                        className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-80 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-2xl p-8 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">New Arrivals</h3>
                  <p className="text-4xl font-bold text-yellow-300 mb-4 animate-pulse">20% OFF</p>
                  <p className="text-sm text-orange-100 mb-6">Fresh styles just in with exclusive discount!</p>
                  <Link
                    href="/new-arrivals"
                    className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/sale"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2 shadow-lg"
            >
              <span>Show All Sale</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch relative">
          {/* Left: 3D image */}
          <div className="relative w-full md:w-2/5 flex items-center justify-center min-h-[320px]">
            <Blurry3DImageBackground src="/images/mygirlfont.png" alt="Collections Font" side="left" />
          </div>
          {/* Right: Cards grid */}
          <div className="w-full md:w-3/5 flex flex-col justify-center z-10">
            <div className="text-center md:text-left mb-12 md:pl-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                Explore Our <span className="text-orange-600">Collections</span>
              </h2>
              <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                Discover different styles of Nepali cultural dresses
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:pl-12">
              {collectionsLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="relative group overflow-hidden rounded-2xl bg-white/80 shadow-lg animate-pulse">
                    <div className="w-full h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : collections.length > 0 ? (
                collections.map((collection: Collection) => (
                  <div key={collection.id} className="relative group overflow-hidden rounded-2xl bg-white/80 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up">
                    <Link href={collection.link}>
                      <div className="relative w-full h-48 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                        {collection.imageUrl && collection.imageUrl.startsWith('data:image/svg+xml') ? (
                          <img
                            src={collection.imageUrl}
                            alt={collection.name + ' icon'}
                            className="w-16 h-16 object-contain z-10 drop-shadow-lg"
                          />
                        ) : (
                          <Image
                            src={collection.imageUrl || '/images/logoshop.png'}
                            alt={collection.name + ' icon'}
                            width={64}
                            height={64}
                            className="object-contain z-10 drop-shadow-lg"
                          />
                        )}
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs shadow-lg border border-white/30 backdrop-blur-md">
                          {collection.count}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{collection.name}</h3>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-lg">No collections available at the moment.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Moving Offers Animation */}
      <AnimatedSection delay={600} direction="left">
        <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">
              Special <span className="text-yellow-300">Offers</span>
            </h2>
            <p className="text-xl animate-fade-in-up animation-delay-200">
              Eye-catching deals that won't last long!
            </p>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex space-x-8 animate-scroll-infinite">
              {[...offers, ...offers].map((offer, index) => (
                <div key={index} className="flex-shrink-0 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 min-w-[300px] hover:transform hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-yellow-300 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-3xl font-bold text-yellow-300 mb-4">{offer.discount}</p>
                    <Link 
                      href={offer.type === 'new-arrivals' ? '/new-arrivals' : (offer.link || "/sale")} 
                      className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* Service Reviews Section */}
      <AnimatedSection delay={800} direction="right">
        <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Why Choose <span className="text-orange-600">आमाको Saaरी</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceReviews.map((review, index) => (
              <div 
                key={review.title}
                className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <review.icon className={`w-8 h-8 ${review.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h3>
                  <p className="text-gray-600 text-sm">{review.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* New Arrivals Section */}
      <AnimatedSection delay={1000} direction="up">
        <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                New <span className="text-orange-600">Arrivals</span>
                <span className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  20% OFF
                </span>
              </h2>
              <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                Fresh styles just in with exclusive discount!
              </p>
            </div>
            <Link 
              href="/new-arrivals" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <NewArrivalsProducts user={user} onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlistItems={wishlistItems} />
        </div>
      </section>
      </AnimatedSection>

      {/* Men's Wear Section */}
      <AnimatedSection delay={1200} direction="up">
        <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                Men's <span className="text-orange-600">Wear</span>
              </h2>
              <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                Traditional and modern styles for men
              </p>
            </div>
            <Link 
              href="/categories/men" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <MensWearProducts user={user} onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlistItems={wishlistItems} />
        </div>
      </section>
      </AnimatedSection>

      {/* Women's Wear Section */}
      <AnimatedSection delay={1400} direction="up">
        <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                Women's <span className="text-orange-600">Wear</span>
              </h2>
              <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                Traditional and modern styles for women
              </p>
            </div>
            <Link 
              href="/categories/women" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <WomensWearProducts user={user} onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlistItems={wishlistItems} />
        </div>
      </section>
      </AnimatedSection>

      {/* Kids Wear Section */}
      <AnimatedSection delay={1600} direction="up">
        <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                Kids <span className="text-orange-600">Wear</span>
              </h2>
              <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                Traditional and modern styles for kids
              </p>
            </div>
            <Link 
              href="/categories/kids" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <KidsWearProducts user={user} onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlistItems={wishlistItems} />
        </div>
      </section>
      </AnimatedSection>

      {/* Jewellery Section */}
      <AnimatedSection delay={1800} direction="up">
        <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                Jewellery <span className="text-orange-600">Designer</span>
              </h2>
              <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                Explore our exclusive collection
              </p>
            </div>
            <Link 
              href="/categories/jewellery" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <JewelleryProducts user={user} onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlistItems={wishlistItems} />
        </div>
      </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={2000} direction="up">
        <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">
            Ready to Experience Nepali Culture with आमाको Saaरी?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Join thousands of women who celebrate tradition and style with आमाको Saaरी.
          </p>
          <Link 
            href="/products" 
            className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2 shadow-lg"
          >
            <span>Start Shopping Today</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      </AnimatedSection>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        
        .animate-scroll-infinite {
          animation: scroll 30s linear infinite;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Animated Gradient CSS */}
      <style jsx global>{`
        .animated-gradient-bg {
          background: linear-gradient(270deg, #ff5e00, #ff0080, #ffb347, #ff5e62, #ff0080, #ff5e00);
          background-size: 1200% 1200%;
          animation: shimmerGradient 18s ease-in-out infinite;
        }
        @keyframes shimmerGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
          border: 1.5px solid rgba(255,255,255,0.25);
          background: linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%);
          backdrop-filter: blur(18px) saturate(1.2);
          -webkit-backdrop-filter: blur(18px) saturate(1.2);
          border-radius: 2rem;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 600px) {
          .animated-gradient-bg {
            background-size: 200% 200%;
          }
        }
      `}</style>

      <WishlistSuccessNotification
        isVisible={showSuccessNotification}
        type={successNotificationType}
        message={successNotificationMessage}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  )
}

