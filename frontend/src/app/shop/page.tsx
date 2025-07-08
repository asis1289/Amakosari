'use client'

import { useState, useEffect } from 'react'
import { 
  Filter, 
  Search, 
  Grid, 
  List, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import ProductCard from '../../components/ProductCard'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import WishlistSuccessNotification from '../../components/WishlistSuccessNotification'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrl: string
  category: string
  sizes: string[]
  colors: string[]
  stock: number
  isOnSale?: boolean
  isNewArrival?: boolean
  isFeatured?: boolean
  tags?: string[]
  createdAt?: string
  reviews?: Array<{
    rating: number
    comment: string
    user: { firstName: string; lastName: string }
  }>
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [cartCount, setCartCount] = useState(0)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSize, setSelectedSize] = useState('All')
  const [selectedColor, setSelectedColor] = useState('All')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // UI states
  const [showFilters, setShowFilters] = useState(false)
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({})
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart')
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('')

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products?limit=100')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
          setFilteredProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
    // Real-time updates
    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socket.on('product-updated', () => {
      fetchProducts()
    })
    return () => { socket.disconnect() }
  }, [])

  // Check user authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          return
        }

        const response = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          fetchWishlist()
          fetchCartCount()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }

    checkAuth()
  }, [])

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.wishlistItems?.map((item: any) => item.productId) || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/cart/count', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Size filter
    if (selectedSize !== 'All') {
      filtered = filtered.filter(product => product.sizes.includes(selectedSize))
    }

    // Color filter
    if (selectedColor !== 'All') {
      filtered = filtered.filter(product => product.colors.includes(selectedColor))
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    )

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case 'featured':
      default:
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return 0
        })
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, selectedSize, selectedColor, priceRange, sortBy])

  // Get unique categories, sizes, and colors
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]
  const sizes = ['All', ...Array.from(new Set(products.flatMap(p => p.sizes || [])))]
  const colors = ['All', ...Array.from(new Set(products.flatMap(p => p.colors || [])))]

  // Wishlist functions
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to wishlist')
      return
    }

    setLoadingStates(prev => ({ ...prev, [`wishlist-${productId}`]: true }))

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
    } finally {
      setLoadingStates(prev => ({ ...prev, [`wishlist-${productId}`]: false }))
    }
  }

  // Cart functions
  const addToCart = async (productId: string) => {
    setLoadingStates(prev => ({ ...prev, [`cart-${productId}`]: true }))

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
        fetchCartCount()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Cart error:', error)
      toast.error('Failed to add to cart')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`cart-${productId}`]: false }))
    }
  }

  // Calculate average rating
  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedSize('All')
    setSelectedColor('All')
    setPriceRange({ min: 0, max: 1000 })
    setSortBy('featured')
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} products found
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
                {/* Sort */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Size Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* Color Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                    showActions={true}
                    user={user}
                  />
                ))}
              </div>
            )}
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