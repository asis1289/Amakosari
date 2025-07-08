'use client'

import { FileText, Shield, CreditCard, Truck, Users, Mail, Phone } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Terms of <span className="text-yellow-300">Service</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Please read these terms carefully before using आमाको Saaरी
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Last Updated */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Last Updated: July 5, 2024</h2>
            </div>
            <p className="text-gray-700">
              These Terms of Service ("Terms") govern your use of the आमाको Saaरी website and services. By accessing or using our website, you agree to be bound by these Terms.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                By accessing and using the आमाको Saaरी website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date.
              </p>
            </div>
          </div>

          {/* Use License */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Use License</h2>
            <div className="space-y-4 text-gray-700">
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on आमाको Saaरी's website for personal, non-commercial transitory viewing only.</p>
              <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="space-y-2 ml-4">
                <li>• Modify or copy the materials</li>
                <li>• Use the materials for any commercial purpose or for any public display</li>
                <li>• Attempt to reverse engineer any software contained on the website</li>
                <li>• Remove any copyright or other proprietary notations from the materials</li>
                <li>• Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </div>
          </div>

          {/* User Accounts */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              3. User Accounts
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:</p>
              <ul className="space-y-2 ml-4">
                <li>• Maintaining the confidentiality of your account and password</li>
                <li>• Restricting access to your computer and mobile devices</li>
                <li>• Accepting responsibility for all activities that occur under your account</li>
                <li>• Notifying us immediately of any unauthorized use of your account</li>
              </ul>
              <p>We reserve the right to terminate accounts, remove or edit content, or cancel orders at our sole discretion.</p>
            </div>
          </div>

          {/* Products and Services */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              4. Products and Services
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>All products are subject to availability. We reserve the right to discontinue any product at any time and to limit quantities of any products.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Product Descriptions</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• We strive to display accurate product information</li>
                    <li>• Colors may vary due to monitor settings</li>
                    <li>• Sizes are approximate and may vary</li>
                    <li>• Product images are for illustration purposes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• All prices are in Australian Dollars (AUD)</li>
                    <li>• Prices are subject to change without notice</li>
                    <li>• Taxes and shipping are additional</li>
                    <li>• We reserve the right to correct pricing errors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Orders and Payment */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 text-purple-600 mr-3" />
              5. Orders and Payment
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>By placing an order, you offer to purchase the product at the price listed. We reserve the right to accept or decline your order for any reason.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Methods</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Credit cards (Visa, MasterCard, American Express)</li>
                    <li>• PayPal</li>
                    <li>• Bank transfers</li>
                    <li>• Cash on delivery (Australia only)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Confirmation</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Orders are confirmed via email</li>
                    <li>• Payment is processed at time of order</li>
                    <li>• Orders may be cancelled within 2 hours</li>
                    <li>• Custom orders require full payment upfront</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping and Delivery */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Truck className="w-6 h-6 text-orange-600 mr-3" />
              6. Shipping and Delivery
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Delivery times are estimates only. We are not responsible for delays beyond our control.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Options</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Standard shipping: 7-14 business days</li>
                    <li>• Express shipping: 2-5 business days</li>
                    <li>• International shipping: 10-21 days</li>
                    <li>• Free shipping on orders over $100</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery Terms</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Risk of loss transfers upon delivery</li>
                    <li>• Signature required for orders over $200</li>
                    <li>• International customs fees may apply</li>
                    <li>• Remote areas may have extended delivery times</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Returns and Refunds */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Returns and Refunds</h2>
            <div className="space-y-4 text-gray-700">
              <p>We offer a 30-day return policy for most items. Items must be unworn, unwashed, and in original condition with all tags attached.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Returnable Items</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Items in original condition</li>
                    <li>• Unworn clothing with tags</li>
                    <li>• Defective items</li>
                    <li>• Wrong size or color</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Non-Returnable Items</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Worn or damaged items</li>
                    <li>• Sale items (final sale)</li>
                    <li>• Custom made items</li>
                    <li>• Personal hygiene items</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4">Refunds are processed within 5-7 business days after we receive your return.</p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <p>The content on this website, including text, graphics, logos, images, and software, is the property of आमाको Saaरी and is protected by copyright laws.</p>
              <p>You may not reproduce, distribute, or create derivative works from this content without our express written permission.</p>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Privacy Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices.</p>
              <p>The Privacy Policy is incorporated into these Terms by reference.</p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>In no event shall आमाको Saaरी be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
              <p>Our total liability to you for any claims arising from these Terms or your use of the website shall not exceed the amount you paid to us in the 12 months preceding the claim.</p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Governing Law</h2>
            <div className="space-y-4 text-gray-700">
              <p>These Terms shall be governed by and construed in accordance with the laws of New South Wales, Australia, without regard to its conflict of law provisions.</p>
              <p>Any disputes arising from these Terms or your use of the website shall be resolved in the courts of New South Wales, Australia.</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="backdrop-blur-xl bg-orange-50/70 rounded-2xl p-8 border border-orange-200/50 shadow-lg">
            <h2 className="text-2xl font-bold text-orange-900 mb-6">Contact Us</h2>
            
            <div className="space-y-4 text-orange-800">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <span>legal@aamakosarri.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span>+61 2 1234 5678</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/50 rounded-xl">
                <p className="font-semibold mb-2">आमाको Saaरी</p>
                <p>Flemington, Sydney, NSW, Australia</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 