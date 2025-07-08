'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Tag, Search } from 'lucide-react';
import AdminNavigation from '../../../components/AdminNavigation';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import GeneratedOfferImage from '../../../components/GeneratedOfferImage';
import AdminSuccessNotification from '../../../components/AdminSuccessNotification';
import { getMessage } from '../../../config/messages';

const LINK_OPTIONS = [
  { label: 'Homepage Banner', value: '/homepage' },
  { label: 'Shop Page', value: '/shop' },
  { label: 'Sale Page', value: '/sale' },
  { label: 'Collections', value: '/collections' },
  { label: 'Cart Page', value: '/cart' },
  { label: 'Checkout Page', value: '/checkout' },
  { label: 'Custom (see offer details)', value: 'custom' },
];

function getDefaultOfferImage(discount?: number) {
  const percent = discount ? `${discount}%` : 'OFFER';
  const color = discount === 5 ? '#34d399' : discount === 10 ? '#60a5fa' : '#f59e42';
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><rect width='100%' height='100%' rx='24' fill='${color}'/><text x='50%' y='50%' font-size='64' font-family='Arial' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'>${percent}</text></svg>`;
}

export default function AdminOffers() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOfferId, setDeleteOfferId] = useState<string>('');
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
        headers: { 'Authorization': `Bearer ${token}` }
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
      await fetchOffers();
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3001/api/offers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setOffers(data.offers || data);
    }
    setLoading(false);
  };

  const handleDeleteOffer = (id: string) => {
    setDeleteOfferId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/offers/${deleteOfferId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setShowDeleteModal(false);
        setSuccessMessage(getMessage('success', 'offer', 'deleted'));
        setNotificationType('success');
        setShowSuccessNotification(true);
        setOffers(prev => prev.filter(offer => offer.id !== deleteOfferId));
        fetchOffers();
      } else {
        const error = await response.json();
        setSuccessMessage(error.error || getMessage('error', 'offer', 'delete'));
        setNotificationType('error');
        setShowSuccessNotification(true);
      }
    } catch (error) {
      setSuccessMessage(getMessage('error', 'offer', 'delete'));
      setNotificationType('error');
      setShowSuccessNotification(true);
    }
  };

  const filteredOffers = offers.filter(offer => 
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
              <p className="text-gray-600 mt-1">Manage promotional offers and banners</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/offers/add"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Offer</span>
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
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                {offer.imageUrl && offer.imageUrl.trim() !== '' ? (
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <GeneratedOfferImage
                    title={offer.title}
                    discount={typeof offer.discount === 'number' && !isNaN(offer.discount) ? offer.discount : 10}
                    variant={typeof offer.variant === 'number' ? offer.variant : 0}
                    width={400}
                    height={192}
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{offer.description}</p>
                <div className="space-y-2 mb-6">
                  {offer.minimumOrderAmount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Min Order:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${offer.minimumOrderAmount}
                      </span>
                    </div>
                  )}
                  {(offer.discount !== undefined && offer.discount !== null) || (offer.discountValue !== undefined && offer.discountValue !== null) ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Discount:</span>
                      <span className="text-sm font-medium text-green-600">
                        {offer.discount}%
                      </span>
                    </div>
                  ) : null}
                  {offer.startDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Start Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(offer.startDate)}</span>
                    </div>
                  )}
                  {offer.endDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">End Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(offer.endDate)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/offers/${offer.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/offers/edit/${offer.id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {formatDate(offer.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first offer.'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/admin/offers/add"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Offer</span>
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
        title="Delete Offer"
        description={getMessage('confirm', 'offer', 'delete')}
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