"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED"
];

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [form, setForm] = useState({ status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
      setForm({ status: data.status });
    }
    setLoading(false);
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm({ status: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: form.status })
      });
      if (res.ok) {
        setSuccess("Order updated successfully!");
        setTimeout(() => router.push("/admin/orders"), 1000);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to update order");
      }
    } catch (err) {
      setError("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!order) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Order not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Edit Order</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block font-medium mb-1">Order #</label>
            <div className="bg-gray-100 px-3 py-2 rounded">{order.orderNumber}</div>
          </div>
          <div>
            <label className="block font-medium mb-1">Customer</label>
            <div className="bg-gray-100 px-3 py-2 rounded">{order.customerName}</div>
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <div className="flex space-x-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>{loading ? "Saving..." : "Update Order"}</button>
            <Link href="/admin/orders" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 