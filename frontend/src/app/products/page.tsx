'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Filter, Grid, List, Search, Star, Heart, Eye } from 'lucide-react'
import ProductCard from '../../components/ProductCard'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import WishlistSuccessNotification from '../../components/WishlistSuccessNotification'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  imageUrl?: string
  description?: string
  category?: {
    name: string
  }
  isOnSale?: boolean
  isNewArrival?: boolean
  createdAt?: string
  reviews?: Array<{
    rating: number
  }>
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

const getCategoryName = (category: any) => typeof category === 'string' ? category : category?.name || '';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart')
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('')

  // Fetch user data and wishlist
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // Check authentication
          const authResponse = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (authResponse.ok) {
            const userData = await authResponse.json()
            setUser(userData.user)

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
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  // Listen for storage events to update wishlist when items are added from other pages
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
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('wishlistUpdated', handleCustomStorageChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('wishlistUpdated', handleCustomStorageChange as EventListener)
    }
  }, [user])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products using the /all endpoint
        const response = await fetch('/api/products/all')
        if (response.ok) {
          const data = await response.json()
          // Handle both array and object responses
          if (Array.isArray(data)) {
            setProducts(data)
          } else if (data.products && Array.isArray(data.products)) {
            setProducts(data.products)
          } else {
            setProducts([])
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          // Handle both array and object responses
          if (Array.isArray(data)) {
            setCategories(data)
          } else if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories)
          } else {
            setCategories([])
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      }
    }

    fetchProducts()
    fetchCategories()

    // --- Real-time updates via Socket.IO ---
    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socket.on('product-updated', (data) => {
      // Refetch products on any product update
      fetchProducts()
    })
    return () => {
      socket.disconnect()
    }
  }, [])

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

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || getCategoryName(product.category) === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        default:
          return 0
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">Discover our complete collection of Nepali cultural dresses</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                variant="default"
                showActions={true}
                onAddToCart={addToCart}
                onAddToWishlist={toggleWishlist}
                isInWishlist={wishlistItems.includes(product.id)}
                user={user}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="group bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-lg">
                        <Image
                          src={product.imageUrl || '/images/products/default.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/products/default.jpg'
                          }}
                        />
                      </div>
                      {product.isOnSale && (
                        <div className="absolute -top-1 -left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                          SALE
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                      {product.category && (
                        <p className="text-sm text-gray-500 mb-2">{getCategoryName(product.category)}</p>
                      )}
                      {product.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-orange-600 font-bold text-lg">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-gray-500 line-through text-sm">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            addToCart(product.id)
                          }}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            toggleWishlist(product.id)
                          }}
                          className={`p-2 rounded-lg border transition-colors ${
                            wishlistItems.includes(product.id)
                              ? 'border-red-300 bg-red-50 text-red-600'
                              : 'border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${wishlistItems.includes(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No products found matching your criteria.</div>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
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