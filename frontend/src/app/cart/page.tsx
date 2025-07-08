'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { 
  ShoppingCart, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  Loader2,
  User,
  LogIn,
  UserPlus
} from 'lucide-react'
import { useUser } from '../../UserContext'

interface CartItem {
  id: string
  productId: string
  quantity: number
  size?: string
  color?: string
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    imageUrl?: string
    stock: number
    category?: string
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

export default function CartPage() {
  const { user } = useUser()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingItems, setUpdatingItems] = useState<{[key: string]: boolean}>({})
  const [removingItems, setRemovingItems] = useState<{[key: string]: boolean}>({})

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true)
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      // Fetch cart items (works for both authenticated and guest users)
      const cartResponse = await fetch('http://localhost:3001/api/cart', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        console.log('Cart data received:', cartData)
        setCartItems(cartData.cartItems || [])
      } else {
        console.error('Failed to fetch cart:', cartResponse.status)
        toast.error('Failed to load cart')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  // Fetch cart on mount and when user changes
  useEffect(() => {
    if (!user) {
      // Guest user: load cart from sessionStorage and fetch product details
      const guestCart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
      if (guestCart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      // Fetch product details for each item
      Promise.all(
        guestCart.map(async (item: any) => {
          const res = await fetch(`/api/products/${item.productId}`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: item.productId,
            productId: item.productId,
            quantity: item.quantity,
            product: data.product
          };
        })
      ).then(items => {
        setCartItems(items.filter(Boolean));
        setLoading(false);
      });
      return;
    }
    fetchCart();
  }, [user]);

  // Listen for storage events to update cart when items are added from other pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated') {
        console.log('Cart updated via storage event')
        fetchCart()
      }
    }

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      console.log('Cart updated via custom event')
      fetchCart()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleCustomStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCustomStorageChange)
    }
  }, [])

  // Check for cart updates every 2 seconds (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem('cartUpdated')
      if (lastUpdate && parseInt(lastUpdate) > Date.now() - 5000) {
        console.log('Cart updated via polling')
        fetchCart()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Update item quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user) {
      let guestCart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
      const idx = guestCart.findIndex((item: any) => item.productId === itemId);
      if (idx > -1 && newQuantity > 0) {
        guestCart[idx].quantity = newQuantity;
        sessionStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCartItems(prev => prev.map(item => item.productId === itemId ? { ...item, quantity: newQuantity } : item));
        localStorage.setItem('cartUpdated', Date.now().toString());
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      return;
    }
    if (newQuantity < 1) return

    setUpdatingItems(prev => ({ ...prev, [itemId]: true }))

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity })
      })

      if (response.ok) {
        setCartItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        )
        toast.success('Cart updated')
        
        // Notify other pages about cart update
        localStorage.setItem('cartUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update cart')
      }
    } catch (error) {
      console.error('Update cart error:', error)
      toast.error('Failed to update cart')
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }))
    }
  }

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    if (!user) {
      let guestCart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
      guestCart = guestCart.filter((item: any) => item.productId !== itemId);
      sessionStorage.setItem('guestCart', JSON.stringify(guestCart));
      setCartItems(prev => prev.filter(item => item.productId !== itemId));
      if (guestCart.length === 0) {
        localStorage.removeItem('guestCart');
      }
      localStorage.setItem('cartUpdated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return;
    }
    setRemovingItems(prev => ({ ...prev, [itemId]: true }))
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })
      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.id !== itemId))
        toast.success('Item removed from cart')
        // Update navbar count immediately
        localStorage.setItem('cartUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        toast.error('Failed to remove item')
      }
    } catch (error) {
      console.error('Remove item error:', error)
      toast.error('Failed to remove item')
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }))
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (!user) {
      sessionStorage.removeItem('guestCart');
      setCartItems([]);
      localStorage.removeItem('guestCart');
      localStorage.setItem('cartUpdated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return;
    }
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })

      if (response.ok) {
        setCartItems([])
        toast.success('Cart cleared')
        
        // Notify other pages about cart update
        localStorage.setItem('cartUpdated', Date.now().toString())
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        toast.error('Failed to clear cart')
      }
    } catch (error) {
      console.error('Clear cart error:', error)
      toast.error('Failed to clear cart')
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.originalPrice || item.product.price
    return sum + (price * item.quantity)
  }, 0)

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">{totalItems} items</p>
            </div>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 border-b border-gray-100 last:border-b-0">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.imageUrl || '/images/accessoriesdefault.png'}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">{item.product.category}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {item.size && (
                              <span className="text-sm text-gray-600">Size: {item.size}</span>
                            )}
                            {item.color && (
                              <span className="text-sm text-gray-600">Color: {item.color}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ${((item.product.originalPrice || item.product.price) * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${(item.product.originalPrice || item.product.price).toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems[item.id] || item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center">
                            {updatingItems[item.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems[item.id] || item.quantity >= item.product.stock}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={removingItems[item.id]}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          {removingItems[item.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Options */}
              {user ? (
                <Link
                  href="/checkout"
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors mb-4 inline-block text-center"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="space-y-3 mb-4">
                  <Link
                    href="/checkout"
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-block text-center"
                  >
                    Checkout as Guest
                  </Link>
                  <div className="text-center text-sm text-gray-600">
                    or
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}

              <Link
                href="/shop"
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 