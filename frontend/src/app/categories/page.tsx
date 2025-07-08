'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  description?: string
  category?: string
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  productCount?: number
}

// Default placeholder images for products without images
const placeholderImages = [
  '/images/products/bangles-1.jpg',
  '/images/products/earrings-1.jpg',
  '/images/products/bindi-set-1.jpg',
  '/images/products/kids-kurta-1.jpg',
  '/images/products/kids-waistcoat-1.jpg',
          '/images/logoshop.png'
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories')
        if (response.ok) {
          const data = await response.json()
          // Add fallback images to categories without images
          const categoriesWithFallbacks = data.map((category: any, index: number) => ({
            ...category,
            imageUrl: category.imageUrl || placeholderImages[index % placeholderImages.length]
          }))
          setCategories(categoriesWithFallbacks || [])
        } else {
          setError('Failed to fetch categories')
        }
      } catch (error) {
        setError('Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Shop by <span className="text-yellow-300">Category</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Explore our collection of traditional Nepali dresses and accessories
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length === 0 ? (
            <div className="text-center">
              <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-white/20 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Categories Found</h2>
                <p className="text-gray-600 mb-6">We're currently updating our categories. Please check back soon!</p>
                <Link 
                  href="/products" 
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                >
                  View All Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Browse Our Collections
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Discover traditional Nepali dresses, jewellery, and accessories organized by category.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group backdrop-blur-xl bg-white/70 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={category.imageUrl || placeholderImages[0]}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {category.name}
                        </h3>
                        {category.productCount && (
                          <p className="text-white/80 text-sm">
                            {category.productCount} products
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center mt-12">
                <div className="backdrop-blur-xl bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 border border-white/20 shadow-xl text-white">
                  <h3 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h3>
                  <p className="text-lg mb-6 max-w-2xl mx-auto">
                    Browse our complete collection or get in touch with us for custom orders.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/products"
                      className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                      View All Products
                    </Link>
                    <Link
                      href="/contact"
                      className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
} 