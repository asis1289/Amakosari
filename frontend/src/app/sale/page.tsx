'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Star, Filter, Grid, List, Tag } from 'lucide-react'
import ProductCard from '../../components/ProductCard'
import { useUser } from '../../UserContext'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import WishlistSuccessNotification from '../../components/WishlistSuccessNotification'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  imageUrl: string
  description: string
  category: string
  rating: number
  reviewCount: number
  isOnSale: boolean
  discounts: any[]
  collections: any[]
  createdAt?: string
}

export default function SalePage() {
  const { user } = useUser()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart')
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('')

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products/sale')
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error('Error fetching sale products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSaleProducts()
    // Real-time updates
    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socket.on('product-updated', () => {
      fetchSaleProducts()
    })
    return () => { socket.disconnect() }
  }, [])

  // Fetch wishlist items
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token && user) {
          const response = await fetch('http://localhost:3001/api/wishlist', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const wishlistData = await response.json()
            setWishlistItems(wishlistData.wishlistItems?.map((item: any) => item.product.id) || [])
          }
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      }
    }

    fetchWishlist()
  }, [user])

  // Cart functions
  const addToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      if (response.ok) {
        triggerSuccessNotification('cart')
        localStorage.setItem('cartUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Cart error:', error)
      toast.error('Failed to add to cart')
    }
  }

  // Wishlist functions
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to wishlist')
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
        }
      })

      if (response.ok) {
        if (isInWishlist) {
          setWishlistItems(prev => prev.filter(id => id !== productId))
          triggerSuccessNotification('wishlist', 'remove')
        } else {
          setWishlistItems(prev => [...prev, productId])
          triggerSuccessNotification('wishlist', 'add')
        }
        localStorage.setItem('wishlistUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('wishlistUpdated'))
      } else {
        toast.error('Failed to update wishlist')
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Failed to update wishlist')
    }
  }

  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'discount':
        const discountA = a.originalPrice ? calculateDiscount(a.originalPrice, a.price) : 0
        const discountB = b.originalPrice ? calculateDiscount(b.originalPrice, b.price) : 0
        return discountB - discountA
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    }
  })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🎉 SALE SEASON! 🎉
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Up to 50% OFF on Traditional Nepali Dresses & Jewellery
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">50%</div>
              <div>Max Discount</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{products.length}</div>
              <div>Products</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">24h</div>
              <div>Left</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-500'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-500'}`}
            >
              <List size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Sale Products Found</h3>
            <p className="text-gray-500">Check back later for amazing deals!</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                variant={viewMode === 'list' ? 'compact' : 'default'}
                showActions={true}
                onAddToCart={addToCart}
                onAddToWishlist={toggleWishlist}
                isInWishlist={wishlistItems.includes(product.id)}
                user={user}
              />
            ))}
          </div>
        )}

        {/* Collections Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Wedding Collection', discount: '30% OFF', color: 'from-pink-500 to-red-500' },
              { name: 'Festival Special', discount: '25% OFF', color: 'from-purple-500 to-pink-500' },
              { name: 'Engagement Collection', discount: '20% OFF', color: 'from-blue-500 to-purple-500' }
            ].map((collection, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${collection.color} text-white rounded-lg p-6 text-center hover:scale-105 transition-transform cursor-pointer`}
              >
                <h3 className="text-xl font-bold mb-2">{collection.name}</h3>
                <p className="text-lg mb-4">{collection.discount}</p>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                  Shop Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <WishlistSuccessNotification
        isVisible={showSuccessNotification}
        type={successNotificationType}
        message={successNotificationMessage}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  )
} 