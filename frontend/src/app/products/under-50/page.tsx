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

// Default placeholder images for products without images
const placeholderImages = [
  '/images/products/bangles-1.jpg',
  '/images/products/earrings-1.jpg',
  '/images/products/bindi-set-1.jpg',
  '/images/products/kids-kurta-1.jpg',
  '/images/products/kids-waistcoat-1.jpg',
          '/images/logoshop.png'
]

export default function Under50ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products/under-50')
        if (response.ok) {
          const data = await response.json()
          // Add fallback images to products without images
          const productsWithFallbacks = data.map((product: Product, index: number) => ({
            ...product,
            imageUrl: product.imageUrl || placeholderImages[index % placeholderImages.length]
          }))
          setProducts(productsWithFallbacks || [])
        } else {
          setError('Failed to fetch products')
        }
      } catch (error) {
        setError('Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
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
            Under <span className="text-yellow-300">$50</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Discover beautiful traditional dresses at budget-friendly prices
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <div className="text-center">
              <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-white/20 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h2>
                <p className="text-gray-600 mb-6">We're currently updating our collection. Please check back soon!</p>
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
                  Budget-Friendly Collection
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Beautiful traditional dresses and accessories, all under $50. Quality craftsmanship at affordable prices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="backdrop-blur-xl bg-white/70 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                  >
                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-64 rounded-t-2xl overflow-hidden">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-orange-600">
                            ${product.price}
                          </span>
                          <span className="text-sm text-gray-500 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Under $50
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center mt-12">
                <div className="backdrop-blur-xl bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 border border-white/20 shadow-xl text-white">
                  <h3 className="text-2xl font-bold mb-4">Looking for More?</h3>
                  <p className="text-lg mb-6 max-w-2xl mx-auto">
                    Explore our full collection of traditional dresses, jewellery, and accessories.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/products"
                      className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                      View All Products
                    </Link>
                    <Link
                      href="/categories"
                      className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                    >
                      Browse Categories
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