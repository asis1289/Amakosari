"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Edit, Trash2, Search } from "lucide-react";
import AdminNavigation from '../../../components/AdminNavigation';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3001/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || data);
    }
    setLoading(false);
  };

  const handleDeleteOrder = (id: string) => {
    setDeleteOrderId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3001/api/orders/${deleteOrderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setShowDeleteModal(false);
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-gray-600 mt-1">View and manage all customer orders</p>
            </div>
          </div>
        </div>
      </div>
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">Loading...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="px-6 py-4 whitespace-nowrap">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link href={`/admin/orders/${order.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/orders/edit/${order.id}`} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDeleteModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
      />
    </div>
  );
} 