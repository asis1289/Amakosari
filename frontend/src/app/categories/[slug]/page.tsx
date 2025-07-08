'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Star, Filter, Grid, List } from 'lucide-react'
import ProductCard from '../../../components/ProductCard'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import WishlistSuccessNotification from '../../../components/WishlistSuccessNotification'
import { useUser } from '../../../UserContext'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  imageUrl: string
  description: string
  category: string
  parentCategory?: string
  rating: number
  reviewCount: number
  isOnSale?: boolean
  isNewArrival?: boolean
  reviews?: Array<{
    id: string
    rating: number
    comment: string
    user: {
      firstName: string
      lastName: string
    }
  }>
  discounts?: Array<{
    id: string
    discountPercentage: number
  }>
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

// Fallback images based on parent category
const getFallbackImage = (parentCategory: string) => {
  const fallbackImages = {
    'men': '/images/mensdefault.jpg',
    'women': '/images/womensdefault.png',
    'kids': '/images/kidsdefault.png',
    'jewellery': '/images/jewellerydefault.png',
    'accessories': '/images/accessoriesdefault.png'
  }
  return fallbackImages[parentCategory.toLowerCase() as keyof typeof fallbackImages] || '/images/logoshop.png'
}

// Parent categories that should show all subcategory products
const PARENT_CATEGORIES = ['women', 'men', 'kids', 'jewellery', 'accessories']

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useUser()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart')
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('')
  const [cartCount, setCartCount] = useState(0)

  // Fetch wishlist and cart count
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
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [user])

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/cart/count', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  // Listen for cart updates
  useEffect(() => {
    fetchCartCount()
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated') {
        fetchCartCount()
      }
    }

    const handleCustomStorageChange = () => {
      fetchCartCount()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleCustomStorageChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCustomStorageChange as EventListener)
    }
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Check if this is a parent category
        if (PARENT_CATEGORIES.includes(slug.toLowerCase())) {
          // Fetch all products for this parent category
          const response = await fetch(`http://localhost:3001/api/categories/${slug}/products`)
          if (response.ok) {
            const data = await response.json()
            setProducts(data.products || [])
            setCategoryName(slug.charAt(0).toUpperCase() + slug.slice(1))
          } else {
            throw new Error('Failed to fetch parent category products')
          }
        } else {
          // Fetch products for individual category
          const response = await fetch(`http://localhost:3001/api/categories/${slug}`)
          if (response.ok) {
            const data = await response.json()
            const productsArray = data.category?.products || []
            setProducts(productsArray)
            
            if (data.category) {
              setCategoryName(data.category.name || slug)
            } else {
              setCategoryName(slug)
            }
          } else {
            // Fallback to products endpoint
            const productsResponse = await fetch(`http://localhost:3001/api/products?category=${slug}`)
            if (productsResponse.ok) {
              const productsData = await productsResponse.json()
              const productsArray = Array.isArray(productsData) ? productsData : (productsData.products || [])
              setProducts(productsArray)
              setCategoryName(slug)
            } else {
              setProducts([])
              setCategoryName(slug)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setCategoryName(slug)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProducts()
      // Real-time updates
      const socket = io('http://localhost:3001', { transports: ['websocket'] })
      socket.on('product-updated', () => {
        fetchProducts()
      })
      return () => { socket.disconnect() }
    }
  }, [slug])

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
        credentials: 'include',
        body: JSON.stringify({ productId, quantity: 1 })
      })

      if (response.ok) {
        triggerSuccessNotification('cart')
        setCartCount(prev => prev + 1)
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

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-4">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link href="/" className="hover:text-orange-200">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-orange-200">Categories</Link>
            <span>/</span>
            <span className="text-orange-200">{categoryName || slug}</span>
          </nav>
          
          <h1 className="text-4xl font-bold mb-4">
            {categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : slug.charAt(0).toUpperCase() + slug.slice(1)}
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl">
            Discover our beautiful collection of {categoryName || slug.toLowerCase()}
          </p>
          <p className="text-orange-200 mt-2">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts && sortedProducts.length > 0 && sortedProducts.map((product) => (
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
            {sortedProducts && sortedProducts.length > 0 && sortedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg p-4 flex gap-4">
                <Link href={`/products/${product.id}`} className="flex-shrink-0">
                  <div className="relative w-32 h-32 overflow-hidden rounded-lg">
                    <Image
                      src={product.imageUrl || getFallbackImage(product.parentCategory || 'accessories')}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = getFallbackImage(product.parentCategory || 'accessories')
                      }}
                    />
                  </div>
                </Link>
                
                <div className="flex-1">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-600">
                      ${product.price?.toFixed(2) || '0.00'}
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addToCart(product.id)}
                      className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
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
            ))}
          </div>
        )}

        {/* Empty State */}
        {(!sortedProducts || sortedProducts.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              No products available in this category yet.
            </p>
            <Link 
              href="/products" 
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
            >
              Browse All Products
            </Link>
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