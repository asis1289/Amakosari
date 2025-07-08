"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Sale {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  collection?: { name: string };
}

export default function ViewSalePage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params?.id;
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (saleId) fetchSale();
  }, [saleId]);

  const fetchSale = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/sales/${saleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSale(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!sale) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Sale not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Sale Details</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <span className="font-medium">Name:</span> {sale.name}
          </div>
          <div>
            <span className="font-medium">Description:</span> {sale.description}
          </div>
          <div>
            <span className="font-medium">Discount Percent:</span> {sale.discountPercent}%
          </div>
          <div>
            <span className="font-medium">Start Date:</span> {sale.startDate?.slice(0, 10)}
          </div>
          <div>
            <span className="font-medium">End Date:</span> {sale.endDate?.slice(0, 10)}
          </div>
          <div>
            <span className="font-medium">Active:</span> {sale.isActive ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Collection:</span> {sale.collection?.name || "All Products"}
          </div>
        </div>
        <div className="flex space-x-4 mt-6">
          <Link href="/admin/sales" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Sales</Link>
          <Link href={`/admin/sales/edit/${sale.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Sale</Link>
        </div>
      </div>
    </div>
  );
} 