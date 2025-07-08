'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Star, Heart, ShoppingCart, Share2, Eye, ChevronLeft, ChevronRight, Truck, Shield, RotateCcw, MessageCircle, ThumbsUp, ThumbsDown, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../UserContext';
import WishlistSuccessNotification from '../../../components/WishlistSuccessNotification';
import { 
  ConfettiEffect, 
  FloatingParticles, 
  MagicDust, 
  PulseWave 
} from '../../../components/AdvancedUX';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  model3DUrl?: string;
  sizes: string[];
  colors: string[];
  stock: number;
  category: string;
  isOnSale: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  tags: string[];
  reviews: Review[];
  colorVariants?: ColorVariant[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ColorVariant {
  color: string;
  name: string;
  images: string[];
  stock: number;
}

// Define color options for consistent color rendering
const COLOR_OPTIONS: string[] = [
  'Red', 'Blue', 'Green', 'Black', 'White', 'Gold', 'Pink', 'Purple', 'Orange', 'Yellow', 'Brown', 'Silver', 'Maroon', 'Navy', 'Teal', 'Beige', 'Grey', 'Multicolor'
];

export default function ProductDetails() {
  const params = useParams();
  const { user } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [is3DView, setIs3DView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Zoom and 3D functionality
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Add state for 3D image fallback
  const [is3DImageView, setIs3DImageView] = useState(false);
  const [image3DRotation, setImage3DRotation] = useState({ x: 0, y: 0 });

  // Add state for stock notification
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState('');
  const [notifyError, setNotifyError] = useState('');

  // Add loading states for buttons
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Add state for notification (reuse homepage logic)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successNotificationType, setSuccessNotificationType] = useState<'cart' | 'wishlist'>('cart');
  const [successNotificationMessage, setSuccessNotificationMessage] = useState('');
  const [cartCount, setCartCount] = useState(0); // for cart icon update

  // Guest fallback modal state
  const [showGuestFallback, setShowGuestFallback] = useState(false);

  // Add to Cart: disable if out of stock
  const canAddToCart = product && product.stock > 0;

  // Advanced UX effects for success notification
  const [showConfetti, setShowConfetti] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showMagicDust, setShowMagicDust] = useState(false);
  const [showPulseWave, setShowPulseWave] = useState(false);

  // Enhanced trigger for success notification and effects
  const triggerSuccessNotification = (type: 'cart' | 'wishlist', action: 'add' | 'remove' = 'add') => {
    setSuccessNotificationType(type);
    setSuccessNotificationMessage(
      type === 'cart'
        ? 'Product added to cart successfully!'
        : action === 'add'
          ? 'Product added to wishlist successfully!'
          : 'Product removed from wishlist successfully!'
    );
    setShowSuccessNotification(true);
    setShowConfetti(true);
    setShowParticles(true);
    setShowMagicDust(true);
    setShowPulseWave(true);
    setTimeout(() => setShowConfetti(false), 3000);
    setTimeout(() => setShowParticles(false), 2000);
    setTimeout(() => setShowMagicDust(false), 3000);
    setTimeout(() => setShowPulseWave(false), 2000);
  };

  // Check if product is in wishlist on load
  useEffect(() => {
    if (product) {
      const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const isInWishlist = existingWishlist.some((item: any) => item.productId === product.id);
      setIsWishlisted(isInWishlist);
    }
  }, [product]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        if (data.product.colors && data.product.colors.length > 0) {
          setSelectedColor(data.product.colors[0]);
        }
        if (data.product.sizes && data.product.sizes.length > 0) {
          setSelectedSize(data.product.sizes[0]);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentImages = () => {
    if (!product) return [];
    
    if (product.colorVariants && selectedColor) {
      const variant = product.colorVariants.find(v => v.color === selectedColor);
      return variant ? variant.images : [product.imageUrl];
    }
    
    return [product.imageUrl];
  };

  // Get fallback image based on parent category
  const getFallbackImage = (category: string) => {
    const fallbackImages = {
      'men': '/images/mensdefault.jpg',
      'women': '/images/womensdefault.png',
      'kids': '/images/kidsdefault.png',
      'jewellery': '/images/jewellerydefault.png',
      'accessories': '/images/accessoriesdefault.png'
    };
    
    // Try to determine parent category from product category
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('men') || categoryLower.includes('daura') || categoryLower.includes('bhangra')) {
      return fallbackImages.men;
    } else if (categoryLower.includes('women') || categoryLower.includes('gunyu') || categoryLower.includes('haku') || categoryLower.includes('saari')) {
      return fallbackImages.women;
    } else if (categoryLower.includes('kids') || categoryLower.includes('kurta') || categoryLower.includes('waistcoat')) {
      return fallbackImages.kids;
    } else if (categoryLower.includes('jewellery') || categoryLower.includes('bindi') || categoryLower.includes('earrings') || categoryLower.includes('bangles')) {
      return fallbackImages.jewellery;
    } else if (categoryLower.includes('accessories')) {
      return fallbackImages.accessories;
    }
    
    return '/images/logoshop.png';
  };

  const getAverageRating = () => {
    if (!product?.reviews || product.reviews.length === 0) return 0;
    const total = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / product.reviews.length;
  };

  const getRatingDistribution = () => {
    if (!product?.reviews) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    product.reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  // Zoom functionality
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1) {
      setIsZoomed(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    setIsDragging(true);
    const rect = imageRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleNotifyMe = async () => {
    if (!notifyEmail) return;
    
    setNotifyLoading(true);
    setNotifyError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/stock-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product?.id,
          email: notifyEmail
        })
      });
      
      if (response.ok) {
        setNotifySuccess('You will be notified when this product is back in stock!');
        setNotifyEmail('');
      } else {
        const error = await response.json();
        setNotifyError(error.message || 'Failed to subscribe to notifications');
      }
    } catch (error) {
      setNotifyError('Failed to subscribe to notifications');
    } finally {
      setNotifyLoading(false);
    }
  };

  const addToCart = async () => {
    if (!canAddToCart) {
      toast.error('Product is out of stock');
      return;
    }

    setCartLoading(true);
    try {
      if (!user) {
        // Guest user: store cart in localStorage or show success directly
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const cartItem = {
          productId: product?.id,
          quantity,
          color: selectedColor,
          size: selectedSize
        };
        guestCart.push(cartItem);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        triggerSuccessNotification('cart');
        toast.success('Added to cart!');
      } else {
        // Logged-in user: call API
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/cart/add', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: product?.id,
            quantity,
            color: selectedColor,
            size: selectedSize
          })
        });

        if (response.ok) {
          triggerSuccessNotification('cart');
          toast.success('Added to cart!');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to add to cart');
        }
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      setShowGuestFallback(true);
      return;
    }

    setWishlistLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = isWishlisted ? 'http://localhost:3001/api/wishlist/remove' : 'http://localhost:3001/api/wishlist/add';
      const method = isWishlisted ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: product?.id })
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        triggerSuccessNotification('wishlist', isWishlisted ? 'remove' : 'add');
        toast.success(isWishlisted ? 'Removed from wishlist!' : 'Added to wishlist!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const nextImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handle3DImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setImage3DRotation({ x: -y, y: x });
  };

  const handle3DImageMouseLeave = () => {
    setImage3DRotation({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/products" className="text-orange-600 hover:text-orange-700 font-medium">
            ← Back to Products
          </a>
        </div>
      </div>
    );
  }

  const currentImages = getCurrentImages();
  const averageRating = getAverageRating();
  const ratingDistribution = getRatingDistribution();
  const totalReviews = product.reviews?.length || 0;
  const discountPercent = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-orange-600 transition-colors">Home</a>
          <span>→</span>
          <a href="/products" className="hover:text-orange-600 transition-colors">Products</a>
          <span>→</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden group">
              <div 
                ref={imageRef}
                className="aspect-square relative overflow-hidden cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {is3DView && product.model3DUrl ? (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-orange-600 font-medium">3D View Mode</p>
                      <p className="text-sm text-gray-600 mt-2">Interactive 3D model loading...</p>
                    </div>
                  </div>
                ) : is3DImageView && !product.model3DUrl && product.imageUrl ? (
                  <div
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100"
                    onMouseMove={handle3DImageMouseMove}
                    onMouseLeave={handle3DImageMouseLeave}
                    style={{ perspective: '800px' }}
                  >
                    <div
                      style={{
                        width: '80%',
                        height: '80%',
                        transform: `rotateX(${image3DRotation.x}deg) rotateY(${image3DRotation.y}deg)`,
                        transition: 'transform 0.1s',
                        willChange: 'transform',
                        margin: 'auto',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        background: '#fff',
                      }}
                    >
                      <Image
                        src={currentImages[currentImageIndex] || getFallbackImage(product.category)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        style={{ pointerEvents: 'none' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getFallbackImage(product.category);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full h-full relative"
                    style={{
                      transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                      transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : 'center',
                      cursor: isZoomed ? 'grab' : 'zoom-in',
                      transition: isZoomed ? 'none' : 'transform 0.3s ease'
                    }}
                  >
                    <Image
                      src={currentImages[currentImageIndex] || getFallbackImage(product.category)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      style={{
                        transform: isZoomed ? `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)` : 'translate(0, 0)',
                        transition: isZoomed ? 'none' : 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFallbackImage(product.category);
                      }}
                    />
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Sale Badge */}
                {product.isOnSale && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {discountPercent}% OFF
                  </div>
                )}

                {/* New Arrival Badge */}
                {product.isNewArrival && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    NEW
                  </div>
                )}

                {/* Zoom Controls */}
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  <button
                    onClick={handleZoomIn}
                    className="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-lg shadow-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-lg shadow-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  {isZoomed && (
                    <button
                      onClick={resetZoom}
                      className="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-lg shadow-lg transition-colors"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 3D View Button */}
                {(product.model3DUrl || product.imageUrl) && (
                  <button
                    onClick={() => {
                      if (product.model3DUrl) setIs3DView(!is3DView);
                      else setIs3DImageView(!is3DImageView);
                    }}
                    className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {(product.model3DUrl ? (is3DView ? '2D View' : '3D View') : (is3DImageView ? '2D View' : '3D View'))}
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {currentImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Image
                      src={image || getFallbackImage(product.category)}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFallbackImage(product.category);
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="text-sm text-gray-500 font-medium mb-2">Category: {product.category}</div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-gray-600 ml-2">({totalReviews} reviews)</span>
                </div>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Write a review
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-orange-600">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
                {product.isOnSale && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    Save ${product.originalPrice ? (product.originalPrice - product.price).toFixed(2) : 0}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">Free shipping on orders over $100</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        selectedColor === color
                          ? 'border-orange-500 scale-110 ring-2 ring-orange-400'
                          : 'border-gray-300 hover:border-orange-300'
                      }`}
                      style={{ backgroundColor: COLOR_OPTIONS.includes(color) ? color.toLowerCase() : '#eee' }}
                      title={color}
                    >
                      {selectedColor === color && <span className="text-xs text-white font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        selectedSize === size
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-300 bg-white text-gray-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Stock */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={quantity <= 1 || !canAddToCart}
                >
                  -
                </button>
                <span className="w-16 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={!canAddToCart}
                >
                  +
                </button>
                <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={addToCart}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canAddToCart || cartLoading}
              >
                {cartLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                <span>{cartLoading ? 'Adding...' : canAddToCart ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={addToWishlist}
                  className={`py-3 px-4 rounded-xl border-2 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                  disabled={wishlistLoading}
                >
                  {wishlistLoading ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  )}
                  <span>{wishlistLoading ? 'Updating...' : isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product?.name,
                        text: product?.description,
                        url: window.location.href
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="py-3 px-4 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Notify Me When Available */}
              {!canAddToCart && (
                <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex flex-col items-start space-y-2">
                  <div className="font-semibold text-yellow-800 flex items-center space-x-2">
                    <span>Product is out of stock.</span>
                  </div>
                  <div className="text-sm text-yellow-700">{notifySuccess ? notifySuccess : 'Enter your email to be notified when this product is restocked.'}</div>
                  {!notifySuccess && (
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="email"
                        className="border border-yellow-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Your email address"
                        value={notifyEmail}
                        onChange={e => setNotifyEmail(e.target.value)}
                        disabled={notifyLoading}
                      />
                      <button
                        onClick={handleNotifyMe}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                        disabled={notifyLoading || !notifyEmail}
                      >
                        {notifyLoading ? 'Submitting...' : 'Notify Me'}
                      </button>
                    </div>
                  )}
                  {notifyError && <div className="text-red-600 text-xs mt-1">{notifyError}</div>}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Secure payment</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-700">30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${totalReviews})` },
                { id: 'shipping', label: 'Shipping' },
                { id: 'returns', label: 'Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Traditional Nepali design</li>
                    <li>High-quality fabric</li>
                    <li>Comfortable fit</li>
                    <li>Perfect for special occasions</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{totalReviews} reviews</div>
                    </div>
                    
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-gray-600 w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${totalReviews > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100 : 0}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">
                            {ratingDistribution[rating as keyof typeof ratingDistribution]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-4">
                  {product.reviews?.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {review.user.firstName[0]}{review.user.lastName[0]}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {review.user.firstName} {review.user.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <button className="flex items-center space-x-1 hover:text-orange-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span>Helpful</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-orange-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Free shipping on orders over $100</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700">Standard shipping: $5.99 (3-5 business days)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700">Express shipping: $12.99 (1-2 business days)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Return Policy</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-700">30-day return policy</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700">Free returns for defective items</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700">Return shipping costs may apply</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guest Fallback Modal */}
      {showGuestFallback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6">
              <Heart className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in to use this feature</h2>
            <p className="text-gray-500 mb-8">Sign in to access your saved items and wishlist functionality.</p>
            <div className="flex gap-4 w-full mb-4">
              <a href="/login" className="flex-1 py-3 rounded-lg bg-orange-600 text-white font-semibold text-lg hover:bg-orange-700 transition-colors">Sign In</a>
              <a href="/register" className="flex-1 py-3 rounded-lg bg-gray-700 text-white font-semibold text-lg hover:bg-gray-800 transition-colors">Create Account</a>
            </div>
            <button onClick={() => setShowGuestFallback(false)} className="text-gray-400 hover:text-gray-600 text-base mt-2">Cancel</button>
          </div>
        </div>
      )}

      <WishlistSuccessNotification
        isVisible={showSuccessNotification}
        type={successNotificationType}
        message={successNotificationMessage}
        onClose={() => setShowSuccessNotification(false)}
      />

      {/* Advanced Effects for Success Notification */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        colors={['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']}
      />
      <FloatingParticles 
        isActive={showParticles} 
        count={15}
        type="hearts"
      />
      <MagicDust isActive={showMagicDust} />
      <PulseWave isActive={showPulseWave} />
    </div>
  );
}