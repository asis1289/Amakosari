"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
  categoryRef?: {
    name: string;
    slug: string;
    parentCategory?: string;
  };
}

const DEFAULT_IMAGES: Record<string, string> = {
  men: '/images/mensdefault.jpg',
  women: '/images/womensdefault.png',
  kids: '/images/kidsdefault.png',
  jewellery: '/images/jewellerydefault.png',
  accessories: '/images/accessoriesdefault.png',
};

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setProduct(data.product);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Product Details</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <span className="font-medium">Name:</span> {product.name}
          </div>
          <div>
            <span className="font-medium">Description:</span> {product.description}
          </div>
          <div>
            <span className="font-medium">Price:</span> ${product.price}
          </div>
          {product.originalPrice && (
            <div>
              <span className="font-medium">Original Price:</span> ${product.originalPrice}
            </div>
          )}
          <div>
            <span className="font-medium">Stock:</span> {product.stock}
          </div>
          <div>
            <span className="font-medium">Category:</span>{' '}
            {product.categoryRef ? (
              <>
                <span>{product.categoryRef.name}</span>
                {product.categoryRef.parentCategory && (
                  <span className="ml-2 text-gray-500">(Parent: {product.categoryRef.parentCategory})</span>
                )}
                <span className="ml-2 text-gray-400">[{product.categoryRef.slug}]</span>
              </>
            ) : (
              product.category
            )}
          </div>
          <div>
            <span className="font-medium">Status:</span> {product.isActive ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-medium">On Sale:</span> {product.isOnSale ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">New Arrival:</span> {product.isNewArrival ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Featured:</span> {product.isFeatured ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Created At:</span> {product.createdAt?.slice(0, 10)}
          </div>
          <div>
            <span className="font-medium">Image:</span><br />
            {product.imageUrl && product.imageUrl.trim() !== '' ? (
              <img src={product.imageUrl} alt={product.name} className="w-48 h-48 object-cover rounded mt-2" />
            ) : (
              <img
                src={DEFAULT_IMAGES[(product.category?.toLowerCase() || 'accessories')] || '/images/logoshop.png'}
                alt={product.name}
                className="w-48 h-48 object-cover rounded mt-2"
              />
            )}
          </div>
        </div>
        <div className="flex space-x-4 mt-6">
          <Link href="/admin/products" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Products</Link>
          <Link href={`/admin/products/edit/${product.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Product</Link>
        </div>
      </div>
    </div>
  );
} 