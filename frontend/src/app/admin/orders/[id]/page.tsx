"use client";

import { useEffect, useState } from "react";
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

export default function ViewOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
    }
    setLoading(false);
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
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <span className="font-medium">Order #:</span> {order.orderNumber}
          </div>
          <div>
            <span className="font-medium">Customer:</span> {order.customerName}
          </div>
          <div>
            <span className="font-medium">Total:</span> ${order.totalAmount.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">Status:</span> {order.status}
          </div>
          <div>
            <span className="font-medium">Date:</span> {order.createdAt?.slice(0, 10)}
          </div>
          <div>
            <span className="font-medium">Items:</span>
            <ul className="list-disc ml-6">
              {order.items.map(item => (
                <li key={item.id}>
                  {item.productName} x{item.quantity} (${item.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex space-x-4 mt-6">
          <Link href="/admin/orders" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Orders</Link>
          <Link href={`/admin/orders/edit/${order.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Order</Link>
        </div>
      </div>
    </div>
  );
} 