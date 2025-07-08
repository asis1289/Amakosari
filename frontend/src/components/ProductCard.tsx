'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Eye, ShoppingCart, LogIn, UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { 
  ConfettiEffect, 
  FloatingParticles, 
  RippleEffect, 
  MagicDust,
  PulseWave,
} from './AdvancedUX'
import WishlistSuccessNotification from './WishlistSuccessNotification'
import { useCart } from './CartContext'
import { useWishlist } from './WishlistContext'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  imageUrl?: string
  description?: string
  category?: {
    name: string
  } | string
  isOnSale?: boolean
  isNewArrival?: boolean
  isFeatured?: boolean
  rating?: number
  reviewCount?: number
  createdAt?: string
  stock?: number
}

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
  className?: string
  user?: any
}

export default function ProductCard({ 
  product, 
  variant = 'default', 
  showActions = true,
  className = '',
  user
}: ProductCardProps) {
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [isCartLoading, setIsCartLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showMagicDust, setShowMagicDust] = useState(false)
  const [showPulseWave, setShowPulseWave] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart')
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('')
  const [isStockNotificationLoading, setIsStockNotificationLoading] = useState(false)
  const [isStockNotificationSubscribed, setIsStockNotificationSubscribed] = useState(false)
  const [showGuestWishlistModal, setShowGuestWishlistModal] = useState(false)
  const router = useRouter()
  const { addToCart } = useCart()
  const { wishlist, toggleWishlist } = useWishlist()

  const getCategoryName = (category?: { name: string } | string) => {
    if (typeof category === 'string') {
      return category
    }
    return category?.name || ''
  }

  const getFallbackImage = (category?: { name: string } | string) => {
    const categoryName = getCategoryName(category)
    switch (categoryName.toLowerCase()) {
      case 'men':
      case 'mens':
        return '/images/mensdefault.jpg'
      case 'women':
      case 'womens':
        return '/images/womensdefault.png'
      case 'kids':
      case 'children':
        return '/images/kidsdefault.png'
      case 'jewellery':
      case 'jewelry':
        return '/images/jewellerydefault.png'
      default:
        return '/images/accessoriesdefault.png'
    }
  }

  const getPriceColor = (category?: { name: string } | string) => {
    const categoryName = getCategoryName(category)
    switch (categoryName.toLowerCase()) {
      case 'men':
      case 'mens':
        return 'text-blue-600'
      case 'women':
      case 'womens':
        return 'text-pink-600'
      case 'kids':
      case 'children':
        return 'text-green-600'
      case 'jewellery':
      case 'jewelry':
        return 'text-orange-600'
      default:
        return 'text-orange-600'
    }
  }

  const getGradientBg = (category?: { name: string } | string) => {
    const categoryName = getCategoryName(category)
    switch (categoryName.toLowerCase()) {
      case 'men':
      case 'mens':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50'
      case 'women':
      case 'womens':
        return 'bg-gradient-to-br from-pink-50 to-purple-50'
      case 'kids':
      case 'children':
        return 'bg-gradient-to-br from-green-50 to-blue-50'
      case 'jewellery':
      case 'jewelry':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50'
      default:
        return 'bg-gradient-to-br from-orange-50 to-red-50'
    }
  }

  const triggerSuccessEffects = (type: 'cart' | 'wishlist') => {
    setShowConfetti(true)
    setShowParticles(true)
    setShowMagicDust(true)
    setShowPulseWave(true)
    
    // Set success notification
    setSuccessNotificationType(type)
    setSuccessNotificationMessage(type === 'cart' ? 'Product added to cart successfully!' : 'Product added to wishlist successfully!')
    setShowSuccessNotification(true)
    
    setTimeout(() => setShowConfetti(false), 3000)
    setTimeout(() => setShowParticles(false), 2000)
    setTimeout(() => setShowMagicDust(false), 3000)
    setTimeout(() => setShowPulseWave(false), 2000)
  }

  // Prevent card link click when clicking on action buttons
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Card click handler (navigates to product detail)
  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click is not on a button or link
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('a')
    ) {
      return
    }
    router.push(`/products/${product.id}`)
  }

  const handleWishlistClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) {
      setShowGuestWishlistModal(true);
      return;
    }
    if (isWishlistLoading) return;
    setIsWishlistLoading(true);
    try {
      await toggleWishlist(product.id);
      triggerSuccessEffects('wishlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleCartClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isCartLoading) return;
    setIsCartLoading(true);
    try {
      await addToCart(product.id, 1);
      triggerSuccessEffects('cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsCartLoading(false);
    }
  };

  // Eye button click handler
  const handleEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/products/${product.id}`)
  }

  const handleStockNotification = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (isStockNotificationLoading) return
    // Prompt for email if guest user
    let email = ''
    if (!user) {
      const emailInput = prompt('Please enter your email to get notified when this product is back in stock:')
      if (!emailInput) return
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailInput)) {
        toast.error('Please enter a valid email address')
        return
      }
      email = emailInput
    } else {
      email = user.email || ''
    }
    setIsStockNotificationLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/stock-notifications/add/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      })
      if (response.ok) {
        setIsStockNotificationSubscribed(true)
        toast.success('You will be notified when this product is back in stock!', {
          duration: 4000,
          style: {
            background: '#10b981',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to subscribe to stock notifications')
      }
    } catch (error) {
      console.error('Stock notification error:', error)
      toast.error('Failed to subscribe to stock notifications')
    } finally {
      setIsStockNotificationLoading(false)
    }
  }

  // Responsive sizing for all variants
  const cardClasses = {
    default: 'w-full h-[420px] sm:h-[460px] md:h-[480px] lg:h-[500px]',
    compact: 'w-64 h-[420px] sm:h-[460px] md:h-[480px] lg:h-[500px] flex-shrink-0',
    featured: 'w-full h-[480px] sm:h-[520px] md:h-[550px] lg:h-[580px]'
  }

  const imageClasses = {
    default: 'h-48 sm:h-56 md:h-64 lg:h-72',
    compact: 'h-48 sm:h-56 md:h-64 lg:h-72',
    featured: 'h-56 sm:h-64 md:h-72 lg:h-80'
  }

  const contentClasses = {
    default: 'p-3 sm:p-4',
    compact: 'p-3 sm:p-4',
    featured: 'p-4 sm:p-6'
  }

  return (
    <>
      {/* Advanced Effects */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        colors={['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']}
      />
      <FloatingParticles 
        isActive={showParticles} 
        count={15}
        type="hearts"
      />
      <MagicDust isActive={showMagicDust} />
      <PulseWave isActive={showPulseWave} />
      {/* Modern Success Notification */}
      <WishlistSuccessNotification
        isVisible={showSuccessNotification}
        type={successNotificationType}
        message={successNotificationMessage}
        onClose={() => setShowSuccessNotification(false)}
      />

      {/* Guest Wishlist Modal */}
      {showGuestWishlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6">
              <Heart className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in to use this feature</h2>
            <p className="text-gray-500 mb-8">Sign in to access your saved items and wishlist functionality.</p>
            <div className="flex gap-4 w-full mb-4">
              <a href="/login" className="flex-1 py-3 rounded-lg bg-orange-600 text-white font-semibold text-lg hover:bg-orange-700 transition-colors">Sign In</a>
              <a href="/register" className="flex-1 py-3 rounded-lg bg-gray-700 text-white font-semibold text-lg hover:bg-gray-800 transition-colors">Create Account</a>
            </div>
            <button onClick={() => setShowGuestWishlistModal(false)} className="text-gray-400 hover:text-gray-600 text-base mt-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Card wrapper */}
      <div
        className={`group relative overflow-hidden rounded-2xl bg-white shadow-enhanced product-card-hover transform hover:scale-105 animate-fade-in-up border border-gray-100 hover:border-gray-200 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-orange-500/20 flex flex-col ${cardClasses[variant]} ${className}`}
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        style={{ cursor: 'pointer' }}
      >
        {/* Image Container */}
        <div className={`relative ${imageClasses[variant]} ${getGradientBg(product.category)} overflow-hidden`}>
          <Image
            src={product.imageUrl || getFallbackImage(product.category)}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = getFallbackImage(product.category)
            }}
          />
          
          {/* Enhanced Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1">
            {product.isNewArrival && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full font-semibold shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                NEW
              </span>
            )}
            {product.isOnSale && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full font-semibold shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                SALE
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full font-semibold shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                FEATURED
              </span>
            )}
          </div>
          
          {/* Hover Action Buttons - Responsive */}
          {showActions && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 ease-out">
              <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl transform scale-0 group-hover:scale-100 transition-all duration-500 ease-out animate-morph-fade flex gap-2 sm:gap-3 flex-wrap justify-center">
                  {/* Add to Cart Button or Stock Notification */}
                  {product.stock && product.stock > 0 ? (
                    <RippleEffect>
                      <button
                        disabled={isCartLoading}
                        onClick={(e) => { stopPropagation(e); handleCartClick(e); }}
                        className="cart-wishlist-button morph-button bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 px-3 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 animate-morph-fade button-3d"
                      >
                        {isCartLoading ? (
                          <>
                            <div className="loading-spinner w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="hidden sm:inline">Adding...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Add to Cart</span>
                          </>
                        )}
                      </button>
                    </RippleEffect>
                  ) : (
                    <RippleEffect>
                      <button
                        disabled={isStockNotificationLoading || isStockNotificationSubscribed}
                        onClick={(e) => { stopPropagation(e); handleStockNotification(e); }}
                        className={`py-2 px-3 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 animate-morph-fade button-3d ${
                          isStockNotificationSubscribed
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        {isStockNotificationLoading ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Subscribing...</span>
                          </>
                        ) : isStockNotificationSubscribed ? (
                          <>
                            <span className="text-xs sm:text-sm">✓ Notified</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs sm:text-sm">Notify Me</span>
                          </>
                        )}
                      </button>
                    </RippleEffect>
                  )}
                  
                  {/* Wishlist Button */}
                  <RippleEffect>
                    <button
                      disabled={isWishlistLoading || !user}
                      aria-pressed={wishlist.includes(product.id)}
                      onClick={(e) => {
                        stopPropagation(e);
                        if (!user) {
                          toast.error(
                            <div className="text-center">
                              <p className="font-medium mb-2">Please sign in to add items to wishlist</p>
                              <div className="flex gap-2 justify-center">
                                <a href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium underline">Sign In</a>
                                <span className="text-gray-400">|</span>
                                <a href="/register" className="text-blue-600 hover:text-blue-700 text-sm font-medium underline">Register</a>
                              </div>
                            </div>,
                            { duration: 5000 }
                          );
                          return;
                        }
                        handleWishlistClick(e);
                      }}
                      className={`cart-wishlist-button morph-button p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center animate-morph-fade button-3d ${
                        wishlist.includes(product.id) 
                          ? 'border-red-500 bg-red-500 text-white shadow-red-500/30 scale-110 neon-glow' 
                          : 'border-gray-300 bg-white text-gray-600 hover:border-red-400 hover:bg-red-50 hover:text-red-600 hover:shadow-red-500/20'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isWishlistLoading ? (
                        <div className="loading-spinner w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full"></div>
                      ) : (
                        <Heart size={16} className="sm:w-[18px] sm:h-[18px] transition-all duration-300" fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                      )}
                    </button>
                  </RippleEffect>
                  
                  {/* Eye Button */}
                  <RippleEffect>
                    <button
                      onClick={handleEyeClick}
                      className="p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 border-blue-400 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-blue-500/20 shadow-lg hover:shadow-xl flex items-center justify-center animate-morph-fade button-3d transition-all duration-300"
                    >
                      <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </RippleEffect>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Morphing Border Effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-300/30 transition-all duration-500 ease-out pointer-events-none" />
        </div>

        {/* Content */}
        <div className={`${contentClasses[variant]} flex flex-col flex-1`}>
          {/* Title */}
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem] max-h-[3.5rem] flex items-start group-hover:text-orange-600 transition-colors duration-300">
            {product.name}
          </h3>
          
          {/* Category */}
          <div className="text-xs font-semibold text-gray-500 mb-1">
            {getCategoryName(product.category) || 'Uncategorized'}
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg sm:text-xl font-bold ${getPriceColor(product.category)} group-hover:scale-105 transition-transform duration-300`}>
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'
                    } transition-colors duration-300`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 