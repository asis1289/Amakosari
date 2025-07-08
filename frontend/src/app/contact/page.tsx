'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:3001/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Reset form
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          message: ''
        })

        setShowSuccess(true)
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        // Handle validation errors
        alert(data.error || 'Failed to submit form. Please try again.')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Contact <span className="text-yellow-300">Us</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Get in touch with आमाको Saaरी. We'd love to hear from you!
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                  Send us a Message
                </h2>
                <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                  Have questions about our products or need assistance? We're here to help!
                </p>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="backdrop-blur-xl bg-green-500/20 border border-green-400/50 rounded-2xl p-6 animate-fade-in-up">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <p className="text-green-700 font-semibold">
                      Thank you for your enquiry! We will get back to you soon!
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 resize-none"
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information & Map */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 animate-fade-in-up">
                  Get in Touch
                </h3>

                <div className="space-y-4">
                  <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Visit Us</h4>
                      <p className="text-gray-600">Flemington, Sydney, NSW, Australia</p>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Phone className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Call Us</h4>
                      <p className="text-gray-600">+61 2 1234 5678</p>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Mail className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email Us</h4>
                      <p className="text-gray-600">info@aamakosari.com.au</p>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Hours</h4>
                      <p className="text-gray-600">Mon-Sat: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Sunday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Find Us</h3>
                <div className="aspect-w-16 aspect-h-12 rounded-xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.5!2d151.1!3d-33.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12bb3d3b5b5b5b%3A0x5b5b5b5b5b5b5b5b!2sFlemington%2C%20Sydney%20NSW%2C%20Australia!5e0!3m2!1sen!2sau!4v1234567890"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 animate-fade-in-up">
            Why Choose आमाको Saaरी?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Convenient Location</h3>
              <p className="text-orange-100">Located in the heart of Flemington, easy to reach by public transport</p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Hours</h3>
              <p className="text-orange-100">Extended business hours to accommodate your busy schedule</p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personal Service</h3>
              <p className="text-orange-100">Dedicated support team ready to assist you with any questions</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )
} 