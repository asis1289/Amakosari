'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ArrowLeft,
  Loader2,
  Eye,
  Heart as HeartIcon
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { 
  ConfettiEffect, 
  FloatingParticles, 
  RippleEffect, 
  MagicDust,
  PulseWave
} from '../../components/AdvancedUX'
import { useUser } from '../../UserContext'
import WishlistSuccessNotification from '../../components/WishlistSuccessNotification'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    description: string
    price: number
    originalPrice?: number
    imageUrl: string
    category: string
    stock: number
    sizes: string[]
    colors: string[]
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

export default function WishlistPage() {
  const { user } = useUser()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingItems, setRemovingItems] = useState<{[key: string]: boolean}>({})
  const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMagicDust, setShowMagicDust] = useState(false)
  const [showPulseWave, setShowPulseWave] = useState(false)
  const [stockNotificationLoading, setStockNotificationLoading] = useState<{[key: string]: boolean}>({})
  const [stockNotificationSubscribed, setStockNotificationSubscribed] = useState<{[key: string]: boolean}>({})
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart')
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('')

  // Fetch wishlist data
  const fetchWishlist = async () => {
    try {
      setLoading(true)
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token || !user) {
        setLoading(false)
        return
      }

      // Fetch wishlist items
      const wishlistResponse = await fetch('http://localhost:3001/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json()
        console.log('Wishlist data received:', wishlistData)
        setWishlistItems(wishlistData.wishlistItems || [])
      } else {
        console.error('Failed to fetch wishlist:', wishlistResponse.status)
        toast.error('Failed to load wishlist')
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  // Fetch wishlist on mount and when user changes
  useEffect(() => {
    fetchWishlist()
  }, [user])

  // Listen for storage events to update wishlist when items are added from other pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wishlistUpdated' && user) {
        console.log('Wishlist updated via storage event')
        fetchWishlist()
      }
    }

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      if (user) {
        console.log('Wishlist updated via custom event')
        fetchWishlist()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('wishlistUpdated', handleCustomStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('wishlistUpdated', handleCustomStorageChange)
    }
  }, [user])

  // Check for wishlist updates every 2 seconds (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem('wishlistUpdated')
      if (lastUpdate && parseInt(lastUpdate) > Date.now() - 5000 && user) {
        console.log('Wishlist updated via polling')
        fetchWishlist()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [user])

  const triggerEffects = (type?: 'cart' | 'wishlist', action: 'add' | 'remove' = 'add') => {
    setShowConfetti(true)
    setShowParticles(true)
    setShowSuccess(true)
    setShowMagicDust(true)
    setShowPulseWave(true)
    if (type) {
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
    setTimeout(() => setShowConfetti(false), 3000)
    setTimeout(() => setShowParticles(false), 2000)
    setTimeout(() => setShowSuccess(false), 1500)
    setTimeout(() => setShowMagicDust(false), 3000)
    setTimeout(() => setShowPulseWave(false), 2000)
  }

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string) => {
    setRemovingItems(prev => ({ ...prev, [productId]: true }))

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId))
        triggerEffects('wishlist', 'remove')
        localStorage.setItem('wishlistUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('wishlistUpdated'))
      } else {
        toast.error('Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error)
      toast.error('Failed to remove from wishlist')
    } finally {
      setRemovingItems(prev => ({ ...prev, [productId]: false }))
    }
  }

  // Add item to cart
  const addToCart = async (productId: string) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }))

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      if (response.ok) {
        triggerEffects('cart')
        localStorage.setItem('cartUpdated', Date.now().toString())
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }))
    }
  }

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/wishlist/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setWishlistItems([])
        triggerEffects('wishlist')
        localStorage.setItem('wishlistUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('wishlistUpdated'))
      } else {
        toast.error('Failed to clear wishlist')
      }
    } catch (error) {
      console.error('Clear wishlist error:', error)
      toast.error('Failed to clear wishlist')
    }
  }

  // Stock notification function
  const handleStockNotification = async (productId: string) => {
    setStockNotificationLoading(prev => ({ ...prev, [productId]: true }))

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/stock-notifications/add/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({ email: user?.email || '' })
      })

      if (response.ok) {
        setStockNotificationSubscribed(prev => ({ ...prev, [productId]: true }))
        toast.success('You will be notified when this product is back in stock!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to subscribe to stock notifications')
      }
    } catch (error) {
      console.error('Stock notification error:', error)
      toast.error('Failed to subscribe to stock notifications')
    } finally {
      setStockNotificationLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in to use this feature</h2>
          <p className="text-gray-600 mb-6">Sign in to access your saved items and wishlist functionality.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center max-w-md mx-auto">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding your favorite products to your wishlist!</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Advanced Effects */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']}
      />
      <FloatingParticles 
        isActive={showParticles} 
        count={20}
        type="hearts"
      />
      <MagicDust isActive={showMagicDust} />
      <PulseWave isActive={showPulseWave} />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600 mt-1">{wishlistItems.length} items</p>
              </div>
              <RippleEffect onClick={clearWishlist}>
                <button className="text-red-600 hover:text-red-700 font-medium button-3d">
                  Clear Wishlist
                </button>
              </RippleEffect>
            </div>
          </div>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow relative hover-lift group cursor-pointer" onClick={() => window.location.href = `/products/${item.product.id}`}>
                {/* Product Image */}
                <div className="relative aspect-square">
                  <Image
                    src={item.product.imageUrl || '/images/products/default.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-t-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/products/default.jpg'
                    }}
                  />
                  {/* Remove from Wishlist (Heart toggle) */}
                  <RippleEffect onClick={(e) => { e?.stopPropagation(); removeFromWishlist(item.product.id); }}>
                    <button
                      disabled={removingItems[item.product.id]}
                      aria-pressed={true}
                      className={`absolute top-2 right-2 p-2 rounded-full border-2 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl animate-morph-fade
                        border-red-500 bg-red-500 text-white shadow-red-500/30 scale-110 neon-glow
                        disabled:opacity-50 disabled:cursor-not-allowed button-3d`}
                      title="Remove from wishlist"
                      onClick={(e) => e?.stopPropagation()}
                    >
                      {removingItems[item.product.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <HeartIcon fill="currentColor" className="text-red-500 mr-2" />
                      )}
                    </button>
                  </RippleEffect>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">{item.product.category}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ${item.product.price.toFixed(2)}
                    </span>
                    {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${item.product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    {item.product.stock > 0 ? (
                      <span className="text-sm text-green-600">In Stock</span>
                    ) : (
                      <span className="text-sm text-red-600">Out of Stock</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <RippleEffect>
                      <Link
                        href={`/products/${item.product.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm font-medium button-3d"
                        onClick={(e) => e?.stopPropagation()}
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </Link>
                    </RippleEffect>
                    {item.product.stock > 0 ? (
                      <RippleEffect onClick={(e) => { e?.stopPropagation(); addToCart(item.product.id); }}>
                        <button
                          disabled={addingToCart[item.product.id]}
                          className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 animate-morph-fade button-3d"
                          onClick={(e) => e?.stopPropagation()}
                        >
                          {addingToCart[item.product.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 inline mr-1" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </RippleEffect>
                    ) : (
                      <RippleEffect onClick={(e) => { e?.stopPropagation(); handleStockNotification(item.product.id); }}>
                        <button
                          disabled={stockNotificationLoading[item.product.id] || stockNotificationSubscribed[item.product.id]}
                          className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 animate-morph-fade button-3d ${
                            stockNotificationSubscribed[item.product.id]
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                          onClick={(e) => e?.stopPropagation()}
                        >
                          {stockNotificationLoading[item.product.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : stockNotificationSubscribed[item.product.id] ? (
                            <>
                              <span className="text-xs">✓ Notified</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs">Notify Me</span>
                            </>
                          )}
                        </button>
                      </RippleEffect>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="text-center mt-12">
            <RippleEffect>
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors button-3d"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </RippleEffect>
          </div>
        </div>
      </div>

      <WishlistSuccessNotification
        isVisible={showSuccessNotification}
        type={successNotificationType}
        message={successNotificationMessage}
        onClose={() => setShowSuccessNotification(false)}
      />
    </>
  )
} 