"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
}

export default function ViewCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params?.id;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectionId) fetchCollection();
  }, [collectionId]);

  const fetchCollection = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/collections/${collectionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setCollection(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!collection) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Collection not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Collection Details</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <span className="font-medium">Name:</span> {collection.name}
          </div>
          <div>
            <span className="font-medium">Description:</span> {collection.description}
          </div>
          <div>
            <span className="font-medium">Status:</span> {collection.isActive ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-medium">Product Count:</span> {collection.productCount || 0}
          </div>
          <div>
            <span className="font-medium">Created At:</span> {collection.createdAt?.slice(0, 10)}
          </div>
          <div>
            <span className="font-medium">Image:</span><br />
            {collection.imageUrl && collection.imageUrl.startsWith('data:image/svg+xml') ? (
              // For SVG data URLs, use regular img tag with proper styling
              <img src={collection.imageUrl} alt={collection.name} className="w-48 h-48 object-contain bg-gray-100 rounded mt-2" />
            ) : (
              // For regular images, use object-cover
              <img src={collection.imageUrl || '/images/logoshop.png'} alt={collection.name} className="w-48 h-48 object-cover rounded mt-2" />
            )}
          </div>
        </div>
        <div className="flex space-x-4 mt-6">
          <Link href="/admin/collections" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Collections</Link>
          <Link href={`/admin/collections/edit/${collection.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Collection</Link>
        </div>
      </div>
    </div>
  );
} 