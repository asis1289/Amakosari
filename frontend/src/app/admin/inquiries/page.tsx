"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, CheckCircle, Mail, MailOpen, Search, Copy, Trash2 } from "lucide-react";
import AdminNavigation from '../../../components/AdminNavigation';
import { toast } from "react-hot-toast";
import { io, Socket } from 'socket.io-client';

interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: "READ" | "UNREAD";
  createdAt: string;
}

export default function AdminInquiries() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const prevUnreadCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchInquiries();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchInquiries();
    }, 10000); // 10 seconds

    // Real-time socket.io connection
    const socket: Socket = io('http://localhost:3001', { transports: ['websocket'] });
    socket.on('new-inquiry', (inquiry) => {
      // Play sound and refresh
      audioRef.current?.play();
      fetchInquiries();
      fetchUnreadCount();
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/contact/inquiries", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setInquiries(data);
    }
    setLoading(false);
  };

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/contact/inquiries/unread/count", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setUnreadCount(data.count);
      if (data.count > prevUnreadCount.current) {
        // Play sound for new inquiry
        audioRef.current?.play();
      }
      prevUnreadCount.current = data.count;
    }
  };

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/contact/inquiries/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      fetchInquiries();
      fetchUnreadCount();
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/contact/inquiries/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success('Inquiry deleted');
      fetchInquiries();
      fetchUnreadCount();
    } else {
      toast.error('Failed to delete inquiry');
    }
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied!`);
  };

  const filteredInquiries = inquiries.filter(inq =>
    inq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white ml-2">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
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
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3 min-w-[180px]">Email</th>
                <th className="px-6 py-3 min-w-[140px]">Phone</th>
                <th className="px-6 py-3">Message</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">Loading...</td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">No inquiries found</td>
                </tr>
              ) : (
                filteredInquiries.map(inq => (
                  <tr key={inq.id} className={inq.status === "UNREAD" ? "bg-yellow-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">{inq.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[180px] overflow-hidden text-ellipsis">
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap block">{inq.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[140px] overflow-hidden text-ellipsis">
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap block">{inq.phone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate" title={inq.message}>{inq.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(inq.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-2">
                      <button onClick={() => copyToClipboard(inq.email, 'Email')} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Copy Email">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => copyToClipboard(inq.phone, 'Phone number')} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Copy Phone">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => markAsRead(inq.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View (Mark as Read)">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteInquiry(inq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Inquiry">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 