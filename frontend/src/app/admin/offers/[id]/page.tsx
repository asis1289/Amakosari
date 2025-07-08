"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import GeneratedOfferImage from '../../../../components/GeneratedOfferImage';

interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  discount?: number;
  type?: string;
  variant?: number;
}

export default function ViewOfferPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params?.id;
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (offerId) fetchOffer();
  }, [offerId]);

  const fetchOffer = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/offers/${offerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setOffer(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!offer) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Offer not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Offer Details</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <span className="font-medium">Title:</span> {offer.title}
          </div>
          <div>
            <span className="font-medium">Description:</span> {offer.description}
          </div>
          <div>
            <span className="font-medium">Discount:</span> {offer.discount ? `${offer.discount}%` : "-"}
          </div>
          <div>
            <span className="font-medium">Type:</span> {offer.type || "-"}
          </div>
          <div>
            <span className="font-medium">Link:</span> {offer.link || "-"}
          </div>
          <div>
            <span className="font-medium">Status:</span> {offer.isActive ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-medium">Created At:</span> {offer.createdAt?.slice(0, 10)}
          </div>
          <div>
            <span className="font-medium">Updated At:</span> {offer.updatedAt?.slice(0, 10)}
          </div>
          <div>
            <span className="font-medium">Image:</span><br />
            {offer.imageUrl ? (
              <img src={offer.imageUrl} alt={offer.title} className="w-48 h-48 object-cover rounded mt-2" />
            ) : (
              <GeneratedOfferImage
                title={offer.title}
                discount={typeof offer.discount === 'number' && !isNaN(offer.discount) ? offer.discount : 10}
                variant={typeof offer.variant === 'number' ? offer.variant : 0}
                width={192}
                height={192}
              />
            )}
          </div>
        </div>
        <div className="flex space-x-4 mt-6">
          <Link href="/admin/offers" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Offers</Link>
          <Link href={`/admin/offers/edit/${offer.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Offer</Link>
        </div>
      </div>
    </div>
  );
} 