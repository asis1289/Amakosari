'use client'

import { Shield, Eye, Lock, Users, Globe, Mail, Phone } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Privacy <span className="text-yellow-300">Policy</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Your privacy is important to आमाको Saaरी
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Last Updated */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Last Updated: July 5, 2024</h2>
            </div>
            <p className="text-gray-700">
              This Privacy Policy describes how आमाको Saaरी ("we," "us," or "our") collects, uses, and shares your personal information when you visit our website or make a purchase.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Eye className="w-6 h-6 text-orange-600 mr-3" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-700 mb-3">When you make a purchase or create an account, we collect:</p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li>• Name and contact information (email, phone number)</li>
                  <li>• Shipping and billing addresses</li>
                  <li>• Payment information (processed securely by our payment partners)</li>
                  <li>• Order history and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                <p className="text-gray-700 mb-3">When you visit our website, we automatically collect:</p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li>• Device information (IP address, browser type, operating system)</li>
                  <li>• Usage data (pages visited, time spent, links clicked)</li>
                  <li>• Cookies and similar tracking technologies</li>
                  <li>• Location data (city/country level)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Lock className="w-6 h-6 text-green-600 mr-3" />
              How We Use Your Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Processing</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Process and fulfill your orders</li>
                    <li>• Send order confirmations and updates</li>
                    <li>• Handle returns and exchanges</li>
                    <li>• Provide customer support</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Communication</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Send marketing emails (with your consent)</li>
                    <li>• Respond to your inquiries</li>
                    <li>• Send important updates about our services</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Website Improvement</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Analyze website usage and performance</li>
                    <li>• Improve our products and services</li>
                    <li>• Personalize your shopping experience</li>
                    <li>• Detect and prevent fraud</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Compliance</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Comply with legal obligations</li>
                    <li>• Protect our rights and property</li>
                    <li>• Ensure website security</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              Information Sharing
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">We Do Not Sell Your Information</h3>
                <p className="text-gray-700">
                  We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Providers</h3>
                <p className="text-gray-700 mb-3">We may share your information with trusted service providers who help us:</p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li>• Process payments securely</li>
                  <li>• Ship and deliver your orders</li>
                  <li>• Send emails and communications</li>
                  <li>• Analyze website performance</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Requirements</h3>
                <p className="text-gray-700">
                  We may disclose your information if required by law, court order, or to protect our rights and safety.
                </p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-6 h-6 text-purple-600 mr-3" />
              Your Rights
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Access & Control</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Access your personal information</li>
                    <li>• Update or correct your data</li>
                    <li>• Delete your account</li>
                    <li>• Opt-out of marketing communications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Portability</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Request a copy of your data</li>
                    <li>• Transfer your data to another service</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies & Tracking</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Manage cookie preferences</li>
                    <li>• Opt-out of tracking</li>
                    <li>• Control browser settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Complaints</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Contact us with privacy concerns</li>
                    <li>• File a complaint with authorities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Lock className="w-6 h-6 text-red-600 mr-3" />
              Data Security
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="space-y-2 ml-4">
                <li>• SSL encryption for all data transmission</li>
                <li>• Secure payment processing</li>
                <li>• Regular security audits</li>
                <li>• Limited access to personal data</li>
                <li>• Employee training on data protection</li>
              </ul>
            </div>
          </div>

          {/* International Transfers */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Globe className="w-6 h-6 text-indigo-600 mr-3" />
              International Data Transfers
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
              <p>
                Our servers are located in Australia, and we may use service providers in other countries. We ensure all international transfers are protected by appropriate safeguards.
              </p>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </div>
          </div>

          {/* Changes to This Policy */}
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically for any changes. Your continued use of our website after any changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="backdrop-blur-xl bg-orange-50/70 rounded-2xl p-8 border border-orange-200/50 shadow-lg">
            <h2 className="text-2xl font-bold text-orange-900 mb-6">Contact Us</h2>
            
            <div className="space-y-4 text-orange-800">
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <span>privacy@aamakosarri.com</span>
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