'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import AdminNavigation from '../../../components/AdminNavigation';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import AdminSuccessNotification from '../../../components/AdminSuccessNotification';
import { getMessage } from '../../../config/messages';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentCategory?: string;
  description?: string;
  isActive: boolean;
  imageUrl?: string;
}

export default function AdminCategories() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string>('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [submitting, setSubmitting] = useState(false);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isActive: true
  });

  // Dynamically build parent category options from categories
  const parentCategoryOptions = [
    { id: '', name: 'None (Main Category)' },
    ...Array.from(new Set(categories.map(c => c.parentCategory).filter(Boolean))).map(pc => ({ id: pc!, name: pc! }))
  ];

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
      await fetchCategories(token);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchCategories = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setFormData({
      name: '',
      description: '',
      parentCategory: '',
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      isActive: category.isActive
    });
    setShowEditModal(true);
  };

  const handleDeleteCategory = (id: string) => {
    setDeleteCategoryId(id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (showEditModal && selectedCategory?.id) {
      setUpdatingCategoryId(selectedCategory.id);
    }
    try {
      const token = localStorage.getItem('token');
      const url = showEditModal 
        ? `http://localhost:3001/api/categories/${selectedCategory?.id}`
        : 'http://localhost:3001/api/categories';
      const method = showEditModal ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        })
      });
      if (response.ok) {
        setShowAddModal(false);
        setShowEditModal(false);
        setSuccessMessage(getMessage('success', 'category', showEditModal ? 'updated' : 'created'));
        setNotificationType('success');
        setShowSuccessNotification(true);
        router.push('/admin/categories');
        return;
      } else {
        const error = await response.json();
        setSuccessMessage(error.error || getMessage('error', 'category', showEditModal ? 'update' : 'create'));
        setNotificationType('error');
        setShowSuccessNotification(true);
      }
    } catch (error) {
      setSuccessMessage(getMessage('error', 'category', showEditModal ? 'update' : 'create'));
      setNotificationType('error');
      setShowSuccessNotification(true);
    } finally {
      setSubmitting(false);
      setUpdatingCategoryId(null);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/categories/${deleteCategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setShowDeleteModal(false);
        setSuccessMessage(getMessage('success', 'category', 'deleted'));
        setNotificationType('success');
        setShowSuccessNotification(true);
        await fetchCategories(token!);
      } else {
        const error = await response.json();
        setSuccessMessage(error.error || getMessage('error', 'category', 'delete'));
        setNotificationType('error');
        setShowSuccessNotification(true);
      }
    } catch (error) {
      setSuccessMessage(getMessage('error', 'category', 'delete'));
      setNotificationType('error');
      setShowSuccessNotification(true);
    }
  };

  const getParentCategoryName = (parent: string) => {
    if (!parent) return 'None';
    return parent;
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
              <span className="text-sm text-gray-500">Manage product categories</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <AdminNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <p className="text-gray-600">Manage your product categories</p>
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-gray-500">{category.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getParentCategoryName(category.parentCategory || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {updatingCategoryId === category.id
                          ? 'Updating...'
                          : (category.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Loading spinner overlay */}
            {submitting && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showAddModal ? 'Add Category' : 'Edit Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {parentCategoryOptions.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (showAddModal ? 'Add Category' : 'Update Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
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