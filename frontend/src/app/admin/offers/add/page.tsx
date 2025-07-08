'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../../../components/AdminNavigation';
import { Upload, ArrowLeft, Plus } from 'lucide-react';
import GeneratedOfferImage, { OFFER_IMAGE_VARIANTS } from '../../../../components/GeneratedOfferImage';
import GeneratedOfferImageModal from '../../../../components/GeneratedOfferImageModal';
import AdminSuccessNotification from '../../../../components/AdminSuccessNotification';
import { getMessage } from '../../../../config/messages';

function getDefaultOfferImage(discountValue?: number) {
  const percent = discountValue ? `${discountValue}%` : 'OFFER';
  const color = discountValue === 5 ? '#34d399' : discountValue === 10 ? '#60a5fa' : '#f59e42';
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><rect width='100%' height='100%' rx='24' fill='${color}'/><text x='50%' y='50%' font-size='64' font-family='Arial' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'>${percent}</text></svg>`;
}

const LINK_OPTIONS = [
  { label: 'Homepage Banner', value: '/homepage' },
  { label: 'Shop Page', value: '/shop' },
  { label: 'Sale Page', value: '/sale' },
  { label: 'Collections', value: '/collections' },
  { label: 'Cart Page', value: '/cart' },
  { label: 'Checkout Page', value: '/checkout' },
  { label: 'Custom (enter below)', value: 'custom' },
];

const OFFER_TYPES = [
  { label: 'All Users (Sitewide)', value: 'ALL' },
  { label: 'New User', value: 'NEW_USER' },
  { label: 'Specific Product', value: 'PRODUCT' },
  { label: 'Specific Collection', value: 'COLLECTION' },
  { label: 'Cart/Order', value: 'CART' },
];

// Utility to convert SVG to PNG and return a Blob
async function svgToPng(svgElement: SVGSVGElement, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject('Failed to convert canvas to blob');
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AddOffer() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    isActive: true,
    minimumOrderAmount: '',
    discount: '',
    startDate: '',
    endDate: '',
    linkValue: '',
    targetProductId: '',
    targetCollectionId: '',
    variant: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkMode, setLinkMode] = useState('');
  const [offerType, setOfferType] = useState('ALL');
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [variant, setVariant] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('image', imageFile);
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        setSuccessMessage(getMessage('success', 'image', 'uploaded'));
        setNotificationType('success');
        setShowSuccessNotification(true);
      } else {
        setNotificationType('error');
        setSuccessMessage('Image upload failed.');
        setShowSuccessNotification(true);
      }
    } catch (err) {
      setNotificationType('error');
      setSuccessMessage('Image upload failed.');
      setShowSuccessNotification(true);
    } finally {
      setUploading(false);
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, link: value, linkValue: value === 'custom' ? '' : value }));
    setLinkMode(value);
  };

  const handleCustomLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, link: e.target.value, linkValue: e.target.value }));
  };

  const handleGenerateImage = () => {
    const discount = Number(formData.discount);
    const url = getDefaultOfferImage(discount);
    setGeneratedImageUrl(url);
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  useEffect(() => {
    fetchProductsAndCollections();
  }, []);

  useEffect(() => {
    setVariant(0);
    setFormData(prev => ({ ...prev, variant: 0 }));
    if (!formData.imageUrl && formData.title && formData.discount) {
      setGeneratedImageUrl('GENERATE');
    } else {
      setGeneratedImageUrl("");
    }
    // eslint-disable-next-line
  }, [formData.title, formData.discount]);

  const fetchProductsAndCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch products
      const productsResponse = await fetch('http://localhost:3001/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || productsData);
      }
      // Fetch collections
      const collectionsResponse = await fetch('http://localhost:3001/api/collections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData.collections || collectionsData);
      }
    } catch (error) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    let imageUrl = formData.imageUrl;
    // If no image uploaded, generate PNG from SVG and upload
    if (!imageUrl) {
      const svg = document.querySelector('#offer-image-preview svg') as SVGSVGElement;
      if (svg) {
        try {
          const pngBlob = await svgToPng(svg, 256, 128);
          const form = new FormData();
          form.append('image', pngBlob, 'offer.png');
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:3001/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: form
          });
          if (response.ok) {
            const data = await response.json();
            imageUrl = data.url;
          } else {
            setNotificationType('error');
            setSuccessMessage('Failed to upload generated image.');
            setShowSuccessNotification(true);
            return;
          }
        } catch (err) {
          setNotificationType('error');
          setSuccessMessage('Failed to generate image.');
          setShowSuccessNotification(true);
          return;
        }
      }
    }
    if (!formData.title || !formData.description) {
      setNotificationType('error');
      setSuccessMessage('Title and description are required.');
      setShowSuccessNotification(true);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        imageUrl,
        variant,
        discount: formData.discount,
        type: offerType,
        targetProductId: offerType === 'PRODUCT' ? formData.targetProductId : null,
        targetCollectionId: offerType === 'COLLECTION' ? formData.targetCollectionId : null,
        isForNewUser: offerType === 'NEW_USER',
        minimumOrderAmount: offerType === 'CART' ? formData.minimumOrderAmount : null,
      };
      const response = await fetch('http://localhost:3001/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setSuccessMessage(getMessage('success', 'offer', 'created'));
        setNotificationType('success');
        setShowSuccessNotification(true);
        setTimeout(() => router.push('/admin/offers'), 1200);
      } else {
        const data = await response.json();
        setNotificationType('error');
        setSuccessMessage(data.error || getMessage('error', 'offer', 'create'));
        setShowSuccessNotification(true);
      }
    } catch (err) {
      setNotificationType('error');
      setSuccessMessage(getMessage('error', 'offer', 'create'));
      setShowSuccessNotification(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/offers" className="text-gray-600 hover:text-gray-900 flex items-center">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Add Offer</h1>
            </div>
          </div>
        </div>
      </div>
      <AdminNavigation />
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type *</label>
            <select
              value={offerType}
              onChange={e => setOfferType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {OFFER_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {offerType === 'PRODUCT' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Product *</label>
                <select
                  value={formData.targetProductId || ''}
                  onChange={e => setFormData(prev => ({ ...prev, targetProductId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            {offerType === 'COLLECTION' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Collection *</label>
                <select
                  value={formData.targetCollectionId || ''}
                  onChange={e => setFormData(prev => ({ ...prev, targetCollectionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select collection</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            {offerType === 'NEW_USER' && (
              <div className="mt-2 text-blue-600 text-sm">This offer will be available only to new users.</div>
            )}
            {offerType === 'CART' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount</label>
                <input
                  type="number"
                  name="minimumOrderAmount"
                  value={formData.minimumOrderAmount || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm text-gray-600">Where do you want this offer to be displayed? Choose a location below:</p>
            <select
              name="link"
              value={linkMode}
              onChange={handleLinkChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select location</option>
              {LINK_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {linkMode === 'custom' && (
              <input
                type="text"
                name="linkValue"
                value={formData.linkValue || ''}
                onChange={handleCustomLinkChange}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter custom link (e.g. /special-offer)"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Image (optional)</label>
            <div className="flex items-center space-x-4 mt-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={!imageFile || uploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Customize Image
              </button>
            </div>
            {/* Preview uploaded or generated image */}
            <div className="mt-4 w-64 h-32 flex items-center justify-center bg-gray-50 rounded-lg border" id="offer-image-preview">
              {formData.imageUrl && typeof formData.imageUrl === 'string' && formData.imageUrl.trim() !== '' ? (
                <img
                  src={formData.imageUrl}
                  alt="Offer Preview"
                  className="w-full h-full object-cover rounded-lg"
                  onError={e => { e.currentTarget.src = ''; }}
                />
              ) : (
                <GeneratedOfferImage
                  title={formData.title || 'Offer'}
                  discount={!isNaN(Number(formData.discount)) && Number(formData.discount) > 0 ? Number(formData.discount) : 10}
                  width={256}
                  height={128}
                  variant={variant}
                  key={variant} // Force re-render when variant changes
                />
              )}
            </div>
          </div>
          <GeneratedOfferImageModal
            open={showImageModal}
            title={formData.title || 'Offer'}
            discount={!isNaN(Number(formData.discount)) && Number(formData.discount) > 0 ? Number(formData.discount) : 10}
            initialVariant={variant}
            onSave={(newVariant) => {
              console.log('Saving variant:', newVariant);
              setVariant(newVariant);
              setFormData(prev => ({ ...prev, variant: newVariant }));
              setShowImageModal(false);
            }}
            onCancel={() => setShowImageModal(false)}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Active</label>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Offer</span>
          </button>
        </form>
      </div>
      <AdminSuccessNotification
        isVisible={showSuccessNotification}
        message={successMessage}
        type={notificationType}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  );
} 