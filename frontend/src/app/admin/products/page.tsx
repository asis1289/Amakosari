'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Search, Filter, ArrowUpDown, Package } from 'lucide-react';
import AdminNavigation from '../../../components/AdminNavigation';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import AdminSuccessNotification from '../../../components/AdminSuccessNotification';
import { getMessage } from '../../../config/messages';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  stock: number;
  isOnSale: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string>('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const responseData = await response.json();
      const userData = responseData.user;
      if (userData.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      setUser(userData);
      await fetchData(token);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchData = async (token: string) => {
    try {
      setLoading(true);
      // Fetch all products (no limit)
      const productsResponse = await fetch('http://localhost:3001/api/products/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
      // Fetch categories
      const categoriesResponse = await fetch('http://localhost:3001/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || categoriesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/products/${deleteProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setShowDeleteModal(false);
        setSuccessMessage(getMessage('success', 'product', 'deleted'));
        setNotificationType('success');
        setShowSuccessNotification(true);
        setProducts(prev => prev.filter(product => product.id !== deleteProductId));
        fetchData(token!);
      } else {
        const error = await response.json();
        setSuccessMessage(error.error || getMessage('error', 'product', 'delete'));
        setNotificationType('error');
        setShowSuccessNotification(true);
      }
    } catch (error) {
      setSuccessMessage(getMessage('error', 'product', 'delete'));
      setNotificationType('error');
      setShowSuccessNotification(true);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortBy as keyof Product];
    const bValue = b[sortBy as keyof Product];
    
    if (sortOrder === 'asc') {
      return (aValue ?? 0) > (bValue ?? 0) ? 1 : -1;
    } else {
      return (aValue ?? 0) < (bValue ?? 0) ? 1 : -1;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
              <p className="text-gray-600 mt-1">Manage your product catalog</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products/add"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </div>

            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  {product.isOnSale && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Sale</span>
                  )}
                  {product.isNewArrival && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">New</span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Featured</span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{product.category}</span>
                  <span>{formatDate(product.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    product.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`} title={product.isActive ? 'Active' : 'Inactive'} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first product.'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <Link
                href="/admin/products/add"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={getMessage('confirm', 'product', 'delete')}
      />

      <AdminSuccessNotification
        isVisible={showSuccessNotification}
        message={successMessage}
        type={notificationType}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  );
} 