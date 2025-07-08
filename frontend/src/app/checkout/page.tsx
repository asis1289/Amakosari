'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Loader2, 
  CreditCard, 
  Truck, 
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

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
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface GuestInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Form states
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nepal'
  })
  const [billingAddress, setBillingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nepal'
  })
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')

  // Fetch cart and user data
  useEffect(() => {
    const fetchData = async () => {
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
            
            // Pre-fill guest info for authenticated users
            setGuestInfo({
              firstName: userData.user.firstName,
              lastName: userData.user.lastName,
              email: userData.user.email,
              phone: userData.user.phone || ''
            })
          }
        }

        // Fetch cart items
        const cartResponse = await fetch('http://localhost:3001/api/cart', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        })

        if (cartResponse.ok) {
          const cartData = await cartResponse.json()
          setCartItems(cartData.cartItems || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load checkout data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update billing address when same as shipping changes
  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress)
    }
  }, [sameAsShipping, shippingAddress])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.originalPrice || item.product.price
    return sum + (price * item.quantity)
  }, 0)

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    // Validate guest info for guest users
    if (!user && (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email)) {
      toast.error('Please fill in all required guest information')
      return
    }

    // Validate addresses
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please fill in complete shipping address')
      return
    }

    if (!sameAsShipping && (!billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.zipCode)) {
      toast.error('Please fill in complete billing address')
      return
    }

    setProcessing(true)

    try {
      const token = localStorage.getItem('token')
      
      const orderData = {
        products: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.originalPrice || item.product.price,
          size: item.size,
          color: item.color
        })),
        total: subtotal,
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        guestInfo: user ? undefined : guestInfo
      }

      let response
      if (user) {
        // Authenticated user order
        response = await fetch('http://localhost:3001/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(orderData)
        })
      } else {
        // Guest order
        response = await fetch('http://localhost:3001/api/orders/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            guestInfo,
            shippingAddress,
            billingAddress: sameAsShipping ? shippingAddress : billingAddress,
            paymentMethod,
            cartItems: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.originalPrice || item.product.price,
              size: item.size,
              color: item.color
            })),
            total: subtotal
          })
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Order failed')
      }

      const data = await response.json()
      toast.success('Order placed successfully!')
      if (user) {
        router.push('/orders')
      } else {
        // For guest, redirect to confirmation page with tracking token
        router.push(`/order/confirmation?token=${data.trackingToken}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Order failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="flex-1 space-y-8">
            {/* Guest Information (for guest users) */}
            {!user && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Guest Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Billing Address
                </h2>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Same as shipping address</span>
                </label>
              </div>
              
              {!sameAsShipping && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={billingAddress.street}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        required
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={billingAddress.zipCode}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={billingAddress.country}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-3">Cash on Delivery</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-3">Bank Transfer</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.imageUrl || '/images/accessoriesdefault.png'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${((item.product.originalPrice || item.product.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
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

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 