"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "../../../components/ProductCard";
import { toast } from 'react-hot-toast';
import WishlistSuccessNotification from '../../../components/WishlistSuccessNotification'

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  description: string;
  category: string;
  rating?: number;
  reviewCount?: number;
}

interface CollectionProduct {
  product: Product;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  products: CollectionProduct[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart')
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('')

  // Fetch user data and wishlist
  useEffect(() => {
    const fetchUserData = async () => {
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

            // Fetch wishlist items
            const wishlistResponse = await fetch('http://localhost:3001/api/wishlist', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })

            if (wishlistResponse.ok) {
              const wishlistData = await wishlistResponse.json()
              setWishlistItems(wishlistData.wishlistItems?.map((item: any) => item.product.id) || [])
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        
        // First try to fetch by slug
        let response = await fetch(`/api/collections/slug/${slug}`);
        
        // If slug fails, try to fetch by ID (in case the slug is actually an ID)
        if (!response.ok) {
          response = await fetch(`/api/collections/${slug}`);
        }
        
        if (response.ok) {
          const data = await response.json();
          setCollection(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) fetchCollection();
  }, [slug]);

  // Cart functions
  const addToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      if (response.ok) {
        triggerSuccessNotification('cart')
        localStorage.setItem('cartUpdated', Date.now().toString())
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Cart error:', error)
      toast.error('Failed to add to cart')
    }
  }

  // Wishlist functions
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to wishlist')
      return
    }

    try {
      const isInWishlist = wishlistItems.includes(productId)
      const url = isInWishlist 
        ? `http://localhost:3001/api/wishlist/remove/${productId}`
        : `http://localhost:3001/api/wishlist/add/${productId}`
      
      const method = isInWishlist ? 'DELETE' : 'POST'
      
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        if (isInWishlist) {
          setWishlistItems(prev => prev.filter(id => id !== productId))
          triggerSuccessNotification('wishlist', 'remove')
        } else {
          setWishlistItems(prev => [...prev, productId])
          triggerSuccessNotification('wishlist', 'add')
        }
        localStorage.setItem('wishlistUpdated', Date.now().toString())
      } else {
        toast.error('Failed to update wishlist')
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Failed to update wishlist')
    }
  }

  const triggerSuccessNotification = (type: 'cart' | 'wishlist', action: 'add' | 'remove' = 'add') => {
    setSuccessNotificationType(type)
    setSuccessNotificationMessage(
      type === 'cart'
        ? 'Product added to cart successfully!'
        : action === 'add'
          ? 'Product added to wishlist successfully!'
          : 'Product removed from wishlist successfully!'
    )
    setShowSuccessNotification(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
          <div className="h-10 w-1/3 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="h-6 w-1/2 bg-gray-100 rounded mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="backdrop-blur-xl bg-white/70 rounded-2xl border border-white/20 shadow-lg animate-pulse h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-white/20 shadow-xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Collection Not Found</h2>
          <p className="text-gray-600 mb-6">Sorry, we couldn't find this collection.</p>
          <Link href="/" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link href="/" className="hover:text-orange-200">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-orange-200">Collections</Link>
            <span>/</span>
            <span className="text-orange-200">{collection.name}</span>
          </nav>
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-4">
            {collection.name}
            <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs shadow-lg border border-white/30 backdrop-blur-md">
              {collection.products.length} styles
            </span>
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl">{collection.description}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {collection.products.length === 0 ? (
          <div className="text-center py-12">
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border border-white/20 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h2>
              <p className="text-gray-600 mb-6">We're currently updating this collection. Please check back soon!</p>
              <Link href="/products" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300">View All Products</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collection.products.map((collectionProduct) => {
              const product = collectionProduct.product;
              return (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  variant="default"
                  showActions={true}
                  user={user}
                />
              );
            })}
          </div>
        )}
      </div>
      <WishlistSuccessNotification
        isVisible={showSuccessNotification}
        type={successNotificationType}
        message={successNotificationMessage}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  );
} 