'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Search, FolderOpen, Package } from 'lucide-react';
import AdminNavigation from '../../../components/AdminNavigation';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import AdminSuccessNotification from '../../../components/AdminSuccessNotification';
import { getMessage } from '../../../config/messages';

interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
}

export default function AdminCollections() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string>('');
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
      await fetchCollections(token);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchCollections = async (token: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3001/api/collections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || data);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = (id: string) => {
    setDeleteCollectionId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/collections/${deleteCollectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setShowDeleteModal(false);
        setSuccessMessage(getMessage('success', 'collection', 'deleted'));
        setNotificationType('success');
        setShowSuccessNotification(true);
        setCollections(prev => prev.filter(collection => collection.id !== deleteCollectionId));
        fetchCollections(token!);
      } else {
        const error = await response.json();
        setSuccessMessage(error.error || getMessage('error', 'collection', 'delete'));
        setNotificationType('error');
        setShowSuccessNotification(true);
      }
    } catch (error) {
      setSuccessMessage(getMessage('error', 'collection', 'delete'));
      setNotificationType('error');
      setShowSuccessNotification(true);
    }
  };

  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold text-gray-900">Collections Management</h1>
              <p className="text-gray-600 mt-1">Manage product collections and categories</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/collections/add"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Collection</span>
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
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <div key={collection.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                {collection.imageUrl && collection.imageUrl.startsWith('data:image/svg+xml') ? (
                  // For SVG data URLs, use regular img tag with proper styling
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="w-full h-48 object-contain bg-gray-100"
                  />
                ) : (
                  // For regular images, use object-cover
                  <img
                    src={collection.imageUrl || '/images/logoshop.png'}
                    alt={collection.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    collection.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {collection.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{collection.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{collection.description}</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Package className="w-4 h-4" />
                    <span>{collection.productCount || 0} products</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {formatDate(collection.createdAt)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/collections/${collection.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/collections/edit/${collection.id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    collection.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`} title={collection.isActive ? 'Active' : 'Inactive'} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCollections.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first collection.'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/admin/collections/add"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Collection</span>
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
        title="Delete Collection"
        description={getMessage('confirm', 'collection', 'delete')}
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