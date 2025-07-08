'use client'

import { Truck, Clock, MapPin, Package, Globe, Shield, CreditCard } from 'lucide-react'

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Shipping & <span className="text-yellow-300">Delivery</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Fast, reliable shipping to bring आमाको Saaरी to your doorstep
          </p>
        </div>
      </section>

      {/* Shipping Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Shipping Options */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shipping Options</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Standard Shipping */}
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Shipping</h3>
                  <p className="text-gray-600">Reliable delivery within Australia</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Delivery Time:</span>
                    <span className="font-semibold text-gray-900">7-14 business days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cost:</span>
                    <span className="font-semibold text-gray-900">$9.95</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Free on orders:</span>
                    <span className="font-semibold text-gray-900">$100+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Tracking:</span>
                    <span className="font-semibold text-green-600">Included</span>
                  </div>
                </div>
              </div>

              {/* Express Shipping */}
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Express Shipping</h3>
                  <p className="text-gray-600">Fast delivery for urgent orders</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Delivery Time:</span>
                    <span className="font-semibold text-gray-900">2-5 business days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cost:</span>
                    <span className="font-semibold text-gray-900">$19.95</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-semibold text-gray-900">Australia only</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Tracking:</span>
                    <span className="font-semibold text-green-600">Priority</span>
                  </div>
                </div>
              </div>

              {/* International Shipping */}
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">International</h3>
                  <p className="text-gray-600">Worldwide delivery available</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Delivery Time:</span>
                    <span className="font-semibold text-gray-900">10-21 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cost:</span>
                    <span className="font-semibold text-gray-900">From $25</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-semibold text-gray-900">Most countries</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Tracking:</span>
                    <span className="font-semibold text-green-600">Included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Delivery Information</h2>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="w-6 h-6 text-orange-600 mr-3" />
                    Order Processing
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p>• Orders are processed within 1-2 business days</p>
                    <p>• Custom orders may take 2-4 weeks to complete</p>
                    <p>• You'll receive an email confirmation when your order ships</p>
                    <p>• Tracking information is provided via email</p>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-6 h-6 text-red-600 mr-3" />
                    Delivery Areas
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p>• <strong>Australia:</strong> All states and territories</p>
                    <p>• <strong>International:</strong> Most countries worldwide</p>
                    <p>• <strong>Remote Areas:</strong> Additional delivery time may apply</p>
                    <p>• <strong>PO Boxes:</strong> Available for standard shipping</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-6 h-6 text-green-600 mr-3" />
                    Package Protection
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p>• All packages are carefully wrapped and protected</p>
                    <p>• Traditional Nepali packaging materials used</p>
                    <p>• Insurance included on all shipments</p>
                    <p>• Signature required for orders over $200</p>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                    Delivery Fees
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p>• <strong>Free shipping</strong> on orders over $100 (Australia)</p>
                    <p>• Standard shipping: $9.95 (Australia)</p>
                    <p>• Express shipping: $19.95 (Australia)</p>
                    <p>• International rates calculated at checkout</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking & Support */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tracking & Support</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Track Your Order</h3>
                <div className="space-y-4 text-gray-700">
                  <p>Once your order ships, you'll receive:</p>
                  <ul className="space-y-2 ml-4">
                    <li>• Email confirmation with tracking number</li>
                    <li>• Real-time tracking updates</li>
                    <li>• Estimated delivery date</li>
                    <li>• Delivery notifications</li>
                  </ul>
                  <p className="mt-4">You can also track your order by logging into your account and visiting the order history section.</p>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h3>
                <div className="space-y-4 text-gray-700">
                  <p>If you have questions about your shipment:</p>
                  <ul className="space-y-2 ml-4">
                    <li>• Contact our customer service team</li>
                    <li>• Check our FAQ section</li>
                    <li>• Email us at shipping@aamakosarri.com</li>
                    <li>• Call us at +61 2 1234 5678</li>
                  </ul>
                  <p className="mt-4">We're here to help ensure your आमाको Saaरी arrives safely and on time!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="backdrop-blur-xl bg-orange-50/70 rounded-2xl p-8 border border-orange-200/50 shadow-lg">
            <h3 className="text-2xl font-bold text-orange-900 mb-4">Important Notes</h3>
            <div className="grid md:grid-cols-2 gap-6 text-orange-800">
              <div>
                <h4 className="font-semibold mb-2">Delivery Times</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Business days exclude weekends and public holidays</li>
                  <li>• Remote areas may have extended delivery times</li>
                  <li>• International customs may cause delays</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Package Handling</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Please inspect packages upon delivery</li>
                  <li>• Report any damage within 24 hours</li>
                  <li>• Keep original packaging for returns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 