'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Search, Calendar, TrendingUp } from 'lucide-react';
import AdminNavigation from '../../../components/AdminNavigation';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';

interface Sale {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  collectionId?: string;
  collection?: {
    name: string;
  };
  createdAt: string;
}

export default function AdminSales() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSaleId, setDeleteSaleId] = useState<string>('');

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
      
      // Fetch sales
      const salesResponse = await fetch('http://localhost:3001/api/sales', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setSales(salesData.sales || salesData);
      }

      // Fetch collections
      const collectionsResponse = await fetch('http://localhost:3001/api/collections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData.collections || collectionsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = (id: string) => {
    setDeleteSaleId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/sales/${deleteSaleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setShowDeleteModal(false);
        setSales(prev => prev.filter(sale => sale.id !== deleteSaleId));
        fetchData(token!);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete sale');
      }
    } catch (error) {
      console.error('Failed to delete sale:', error);
      alert('Failed to delete sale');
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isSaleActive = (sale: Sale) => {
    const now = new Date();
    const startDate = new Date(sale.startDate);
    const endDate = new Date(sale.endDate);
    return sale.isActive && now >= startDate && now <= endDate;
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
              <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
              <p className="text-gray-600 mt-1">Manage promotional sales and discounts</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/sales/add"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Sale</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sales Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{sale.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isSaleActive(sale) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isSaleActive(sale) ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{sale.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Discount:</span>
                    <span className="font-semibold text-red-600">{sale.discountPercent}% OFF</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Collection:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {sale.collection?.name || 'All Products'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Start Date:</span>
                    <span className="text-sm text-gray-900">{formatDate(sale.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">End Date:</span>
                    <span className="text-sm text-gray-900">{formatDate(sale.endDate)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/sales/${sale.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/sales/edit/${sale.id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {formatDate(sale.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first sale.'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/admin/sales/add"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Sale</span>
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
        title="Delete Sale"
        description="Are you sure you want to delete this sale? This action cannot be undone."
      />
    </div>
  );
} 