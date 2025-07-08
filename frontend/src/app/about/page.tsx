'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Users, Award, Globe, Star, Sparkles } from 'lucide-react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('story')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            About <span className="text-yellow-300">आमाको Saaरी</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Celebrating Nepali heritage through authentic saaris and traditional dresses
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mission Statement */}
          <div className="text-center mb-16">
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-white/20 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                आमाको Saaरी is more than a store—it's a celebration of Nepali heritage, women's empowerment, and timeless style. 
                We bring you authentic saaris and traditional dresses, handcrafted by skilled Nepali artisans, for every woman and every occasion.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <Heart className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">1000+</div>
              <div className="text-gray-600">Handcrafted Pieces</div>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <Award className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-gray-600">Artisan Partners</div>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <Globe className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">10+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab('story')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'story'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
              >
                Our Story
              </button>
              <button
                onClick={() => setActiveTab('values')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'values'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
              >
                Our Values
              </button>
              <button
                onClick={() => setActiveTab('artisans')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'artisans'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
              >
                Our Artisans
              </button>
            </div>

            {/* Tab Content */}
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-white/20 shadow-xl">
              {activeTab === 'story' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        आमाको Saaरी was born from a deep love for Nepali culture and a desire to share its beauty with the world. 
                        Founded by passionate individuals who grew up surrounded by the rich traditions of Nepal, we understand the 
                        significance of every stitch, every pattern, and every color in our traditional garments.
                      </p>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        Our journey began with a simple mission: to preserve and promote Nepali heritage through authentic, 
                        handcrafted traditional dresses while supporting local women artisans and their communities.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Today, we're proud to connect skilled Nepali artisans with customers worldwide, bringing the elegance 
                        and cultural richness of Nepali fashion to every corner of the globe.
                      </p>
                    </div>
                    <div className="relative h-64 rounded-2xl overflow-hidden">
                      <Image
                        src="/images/logoshop.png"
                        alt="आमाको Saaरी Story"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'values' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Heart className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Cultural Preservation</h4>
                          <p className="text-gray-600">We are committed to preserving and promoting Nepali cultural heritage through authentic traditional fashion.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Women Empowerment</h4>
                          <p className="text-gray-600">Supporting and empowering Nepali women artisans by providing fair wages and sustainable opportunities.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Award className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Quality Craftsmanship</h4>
                          <p className="text-gray-600">Every piece is handcrafted with attention to detail, ensuring the highest quality and authenticity.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Globe className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Global Connection</h4>
                          <p className="text-gray-600">Bridging cultures by bringing Nepali traditions to customers worldwide while maintaining authenticity.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'artisans' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Artisans</h3>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        Behind every beautiful piece at आमाको Saaरी are skilled Nepali artisans who have inherited their 
                        craft from generations of family tradition. These talented women and men bring decades of experience 
                        and passion to every garment they create.
                      </p>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        We work directly with artisan communities across Nepal, ensuring fair compensation and sustainable 
                        working conditions. Our partnerships help preserve traditional techniques while providing economic 
                        opportunities for local families.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Each artisan's story is woven into the fabric of our collections, making every piece not just a 
                        garment, but a testament to Nepali culture and craftsmanship.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-4 text-center">
                          <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900">Traditional Techniques</h4>
                          <p className="text-sm text-gray-600">Hand-weaving and embroidery</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-4 text-center">
                          <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900">Quality Materials</h4>
                          <p className="text-sm text-gray-600">Premium fabrics and threads</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="backdrop-blur-xl bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 border border-white/20 shadow-xl text-white">
              <h3 className="text-2xl font-bold mb-4">Join Our Journey</h3>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Experience the beauty of Nepali culture through our authentic, handcrafted traditional dresses. 
                Every piece tells a story of tradition, love, and pride.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/products"
                  className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Explore Our Collection
                </a>
                <a
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 