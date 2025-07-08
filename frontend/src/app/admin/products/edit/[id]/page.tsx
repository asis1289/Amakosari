'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../../../../components/AdminNavigation';
import { Upload, ArrowLeft, Save } from 'lucide-react';
import AdminSuccessNotification from '../../../../../components/AdminSuccessNotification';
import { getMessage } from '../../../../../config/messages';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentCategory?: string;
}

interface ColorVariant {
  color: string;
  name: string;
}

const DEFAULT_IMAGES: Record<string, string> = {
  men: '/images/mensdefault.jpg',
  women: '/images/womensdefault.png',
  kids: '/images/kidsdefault.png',
  jewellery: '/images/jewellerydefault.png',
  accessories: '/images/accessoriesdefault.png',
};

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [parentCategory, setParentCategory] = useState('');
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
      await fetchCategories(token);
      await fetchColorVariants(token);
      await fetchProduct(token);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchCategories = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || data);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchColorVariants = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/colors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setColorVariants(data);
      }
    } catch (error) {}
  };

  const fetchProduct = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/products/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...data.product,
          isOnSale: !!data.product.isOnSale,
          isFeatured: !!data.product.isFeatured,
          isNewArrival: !!data.product.isNewArrival
        });
        setSelectedColors(data.product.colors || []);
        setSelectedSizes(data.product.sizes || []);
        setParentCategory(data.product.categoryRef?.parentCategory || data.product.parentCategory || '');
      }
    } catch (error) {
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData((prev: any) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
    if (name === 'categoryId') {
      const cat = categories.find((c) => c.id === value);
      setParentCategory(cat?.parentCategory || 'accessories');
      setFormData((prev: any) => ({
        ...prev,
        category: cat?.name || ''
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
        setFormData((prev: any) => ({ ...prev, imageUrl: data.url }));
        setSuccessMessage(getMessage('success', 'image', 'uploaded'));
        setNotificationType('success');
        setShowSuccessNotification(true);
      } else {
        setError('Image upload failed.');
        setNotificationType('error');
        setSuccessMessage('Image upload failed.');
        setShowSuccessNotification(true);
      }
    } catch (err) {
      setError('Image upload failed.');
      setNotificationType('error');
      setSuccessMessage('Image upload failed.');
      setShowSuccessNotification(true);
    } finally {
      setUploading(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleAddNewColor = () => {
    if (newColor && !selectedColors.includes(newColor)) {
      setSelectedColors((prev) => [...prev, newColor]);
      setNewColor('');
    }
  };

  const handleAddSize = () => {
    if (sizeInput && !selectedSizes.includes(sizeInput)) {
      setSelectedSizes((prev) => [...prev, sizeInput]);
      setSizeInput('');
    }
  };
  const handleRemoveSize = (size: string) => {
    setSelectedSizes((prev) => prev.filter((s) => s !== size));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    let imageUrl = formData.imageUrl;
    if (!imageUrl) {
      imageUrl = DEFAULT_IMAGES[parentCategory.toLowerCase()] || '/images/logoshop.png';
    }
    if (!formData.name || !formData.price || !formData.categoryId) {
      setError('Name, price, and category are required.');
      setNotificationType('error');
      setSuccessMessage('Name, price, and category are required.');
      setShowSuccessNotification(true);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          sizes: selectedSizes,
          colors: selectedColors
        })
      });
      if (response.ok) {
        setSuccessMessage(getMessage('success', 'product', 'updated'));
        setNotificationType('success');
        setShowSuccessNotification(true);
        setTimeout(() => router.push('/admin/products'), 1200);
      } else {
        const data = await response.json();
        setNotificationType('error');
        setSuccessMessage(data.error || getMessage('error', 'product', 'update'));
        setShowSuccessNotification(true);
      }
    } catch (err) {
      setNotificationType('error');
      setSuccessMessage(getMessage('error', 'product', 'update'));
      setShowSuccessNotification(true);
    }
  };

  // Get unique parent categories from categories
  const parentCategories = Array.from(new Set(categories.map(cat => cat.parentCategory || 'Other')));
  // Filter categories based on selected parent category
  const filteredCategories = categories.filter(cat => (cat.parentCategory || 'Other') === (parentCategory || 'Other'));

  if (loading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/products" className="text-gray-600 hover:text-gray-900 flex items-center">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            </div>
          </div>
        </div>
      </div>
      <AdminNavigation />
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category *</label>
              <select
                value={parentCategory ?? ''}
                onChange={e => {
                  setParentCategory(e.target.value);
                  setFormData((prev: any) => ({ ...prev, categoryId: '' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select parent category</option>
                {parentCategories.map(pc => (
                  <option key={pc} value={pc}>{pc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Threshold</label>
              <input
                type="number"
                name="stockThreshold"
                value={formData.stockThreshold || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-6 mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isOnSale"
                checked={!!formData.isOnSale}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">On Sale</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={!!formData.isFeatured}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Featured</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={!!formData.isNewArrival}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">New Arrival</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image *</label>
            <div className="flex items-center space-x-4">
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
            </div>
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Product" className="mt-4 w-32 h-32 object-cover rounded-lg border" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedSizes.map((size) => (
                <span key={size} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {size}
                  <button type="button" className="ml-2 text-red-500" onClick={() => handleRemoveSize(size)}>&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={sizeInput}
                onChange={e => setSizeInput(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add size (e.g. S, M, L, XL)"
              />
              <button type="button" onClick={handleAddSize} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {colorVariants.map((variant) => (
                <div key={variant.color + '-' + variant.name} className="relative group">
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative ${selectedColors.includes(variant.color) ? 'border-blue-600' : 'border-gray-300'}`}
                    style={{ backgroundColor: variant.color }}
                    onClick={() => handleColorSelect(variant.color)}
                  >
                    {selectedColors.includes(variant.color) && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">✓</span>
                    )}
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                    {variant.name}
                  </div>
                </div>
              ))}
              <input
                type="text"
                value={newColor}
                onChange={e => setNewColor(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-lg w-24"
                placeholder="Add color"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewColor(); } }}
                title="Type color name or hex and press Enter"
              />
              <button type="button" onClick={handleAddNewColor} className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700">Add</button>
            </div>
            <div className="text-xs text-gray-500">Click a color to select. Hover to see name. Add new color by name or hex.</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3D Model URL</label>
            <input
              type="text"
              name="model3DUrl"
              value={formData.model3DUrl || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. ethnic, traditional, trending"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L x W x H)</label>
            <input
              type="text"
              name="dimensions"
              value={formData.dimensions || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. 10x5x2 cm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
            <input
              type="text"
              name="material"
              value={formData.material || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Cotton, Silk, Alloy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
            <input
              type="text"
              name="careInstructions"
              value={formData.careInstructions || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Hand wash only, Do not bleach"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
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