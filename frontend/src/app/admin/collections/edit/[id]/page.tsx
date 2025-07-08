"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminSuccessNotification from '../../../../../components/AdminSuccessNotification';
import { getMessage } from '../../../../../config/messages';

interface Collection {
  id: string;
  name: string;
  description: string;
  discountPercent?: number;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  isActive: boolean;
  categoryRef?: { name: string };
}

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params?.id;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    discountPercent: "0",
    isActive: true,
    imageUrl: "" as string | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (collectionId) {
      fetchCollection();
      fetchProducts();
    }
    // eslint-disable-next-line
  }, [collectionId]);

  const fetchCollection = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/collections/${collectionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCollection(data);
      setForm({
        name: data.name,
        description: data.description,
        discountPercent: data.discountPercent?.toString() || "0",
        isActive: data.isActive,
        imageUrl: data.imageUrl || "",
      });
      
      // Extract product IDs from the collection data
      if (data.products && Array.isArray(data.products)) {
        const productIds = data.products.map((p: any) => p.productId || p.product?.id || p.id);
        setSelectedProductIds(productIds);
      }
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/products/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products || data);
    }
  };

  const fetchCollectionProducts = async () => {
    // Products are already included in the collection data from fetchCollection
    // This function is no longer needed as we'll extract products from collection data
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddAllProducts = () => {
    setSelectedProductIds(products.map((p) => p.id));
  };

  const handleRemoveAllProducts = () => {
    setSelectedProductIds([]);
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, imageUrl: null }));
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      
      // Create FormData for the collection update
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("discountPercent", form.discountPercent);
      formData.append("isActive", form.isActive.toString());
      
      // Handle image upload
      if (imageFile) {
        // New file selected - upload it
        formData.append("image", imageFile);
      } else if (form.imageUrl === null) {
        // Remove image requested
        formData.append("removeImage", "true");
      }
      // If neither condition is met, keep existing image
      
      // Update collection details
      const res = await fetch(`http://localhost:3001/api/collections/${collectionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update collection");
      }
      
      // Update products in collection
      if (selectedProductIds.length > 0) {
        const res2 = await fetch(`http://localhost:3001/api/collections/${collectionId}/products`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productIds: selectedProductIds }),
        });
        if (!res2.ok) {
          throw new Error("Failed to update products in collection");
        }
      }
      
      setSuccessMessage(getMessage('success', 'collection', 'updated'));
      setNotificationType('success');
      setShowSuccessNotification(true);
      setTimeout(() => router.push("/admin/collections"), 1200);
    } catch (error) {
      console.error("Error updating collection:", error);
      setNotificationType('error');
      setSuccessMessage(error instanceof Error ? error.message : getMessage('error', 'collection', 'update'));
      setShowSuccessNotification(true);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!collection) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Collection not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Edit Collection</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Discount Percent</label>
              <input
                type="number"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select
              name="isActive"
              value={form.isActive ? "true" : "false"}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.value === "true" }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Image</label>
            <div className="flex items-center space-x-4">
              {form.imageUrl && !imageFile && (
                <img src={form.imageUrl} alt="Collection" className="w-24 h-24 object-cover rounded" />
              )}
              {!form.imageUrl && !imageFile && (
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-24 h-24 object-cover rounded" />
              )}
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="block"
                />
                {(form.imageUrl || imageFile) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Leave empty to use default generated image based on collection name
            </p>
          </div>
          <div>
            <label className="block font-medium mb-1">Products in Collection</label>
            <div className="flex items-center mb-2 gap-2">
              <button type="button" onClick={handleAddAllProducts} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Add All Products</button>
              <button type="button" onClick={handleRemoveAllProducts} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600">Remove All</button>
              <span className="text-sm text-gray-600 ml-2">
                {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} selected
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="ml-4 border rounded px-3 py-1"
              />
            </div>
            <div className="max-h-96 overflow-y-auto border rounded p-2 bg-gray-50">
              {filteredProducts.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No products found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Add</th>
                      <th className="p-2 text-left">Image</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id} className={selectedProductIds.includes(product.id) ? "bg-blue-50" : ""}>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => handleProductToggle(product.id)}
                          />
                        </td>
                        <td className="p-2">
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        </td>
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{
                          product.categoryRef?.name || product.category || 'Uncategorized'
                        }</td>
                        <td className="p-2">{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Update Collection"}</button>
            <Link href="/admin/collections" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</Link>
          </div>
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