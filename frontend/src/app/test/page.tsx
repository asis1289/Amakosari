'use client'

import { useState, useEffect } from 'react'
import { useUser } from '../../UserContext'
import { toast } from 'react-hot-toast'
import { ShoppingCart, Heart, Loader2 } from 'lucide-react'

export default function TestPage() {
  const { user } = useUser()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Test cart functionality
  const testCart = async () => {
    if (!user) {
      toast.error('Please login first')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: 'test-product', quantity: 1 })
      })

      if (response.ok) {
        toast.success('Cart test successful!')
        fetchCartCount()
      } else {
        const error = await response.json()
        toast.error(`Cart test failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Cart test error:', error)
      toast.error('Cart test failed')
    } finally {
      setLoading(false)
    }
  }

  // Test wishlist functionality
  const testWishlist = async () => {
    if (!user) {
      toast.error('Please login first')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/wishlist/add/test-product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Wishlist test successful!')
        fetchWishlistCount()
      } else {
        const error = await response.json()
        toast.error(`Wishlist test failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Wishlist test error:', error)
      toast.error('Wishlist test failed')
    } finally {
      setLoading(false)
    }
  }

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:3001/api/cart/count', {
        headers: {
          'Authorization': `Bearer ${token}`
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

  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:3001/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWishlistCount(data.wishlistItems?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCartCount()
      fetchWishlistCount()
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? `${user.firstName} ${user.lastName}` : 'Not logged in'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Counts</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <ShoppingCart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{cartCount}</p>
              <p className="text-sm text-gray-600">Cart Items</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{wishlistCount}</p>
              <p className="text-sm text-gray-600">Wishlist Items</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="space-y-4">
            <button
              onClick={testCart}
              disabled={loading || !user}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Test Cart API
                </>
              )}
            </button>
            
            <button
              onClick={testWishlist}
              disabled={loading || !user}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Test Wishlist API
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/cart"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 text-center"
            >
              Go to Cart
            </a>
            <a
              href="/wishlist"
              className="bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 text-center"
            >
              Go to Wishlist
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}