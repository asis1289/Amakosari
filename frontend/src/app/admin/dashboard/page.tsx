'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  FolderOpen,
  Tags,
  MessageSquare,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import AdminNavigation from '../../../components/AdminNavigation';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeSales: number;
  activeOffers: number;
  totalCategories: number;
  totalCollections: number;
  totalPromoters: number;
  totalInquiries: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface RecentInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const handleUserInteraction = () => setUserInteracted(true);
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    checkAuth();
    // Real-time socket.io connection for new orders
    const socket: Socket = io('http://localhost:3001', { transports: ['websocket'] });
    socket.on('new-order', (order) => {
      if (userInteracted) audioRef.current?.play();
      toast.custom((t) => (
        <div className={`bg-white shadow-lg rounded-lg px-6 py-4 border-l-4 border-green-500 flex items-center space-x-4 ${t.visible ? 'animate-enter' : 'animate-leave'}`}
             style={{ minWidth: 300 }}>
          <ShoppingCart className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-700">New order received!</p>
            <Link href="/admin/orders" className="text-blue-600 underline text-sm">View Orders</Link>
          </div>
        </div>
      ), { duration: 5000 });
    });
    socket.on('new-inquiry', (inquiry) => {
      if (userInteracted) audioRef.current?.play();
      toast.custom((t) => (
        <div className={`bg-white shadow-lg rounded-lg px-6 py-4 border-l-4 border-blue-500 flex items-center space-x-4 ${t.visible ? 'animate-enter' : 'animate-leave'}`}
             style={{ minWidth: 300 }}>
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-700">New inquiry received!</p>
            <Link href="/admin/inquiries" className="text-blue-600 underline text-sm">View Inquiries</Link>
          </div>
        </div>
      ), { duration: 5000 });
    });
    return () => {
      socket.disconnect();
    };
  }, [userInteracted]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Auth response status:', response.status);

      if (!response.ok) {
        console.log('Auth response not ok, removing token and redirecting');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      const userData = responseData.user;
      console.log('User data:', userData);
      console.log('User role:', userData.role);
      
      if (userData.role !== 'ADMIN') {
        console.log('User is not admin, redirecting to home');
        router.push('/');
        return;
      }

      console.log('Auth successful, setting user and fetching data');
      setUser(userData);
      await fetchDashboardData(token);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent orders
      const ordersResponse = await fetch('http://localhost:3001/api/orders?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }

      // Fetch recent inquiries
      const inquiriesResponse = await fetch('http://localhost:3001/api/admin/inquiries?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json();
        setRecentInquiries(inquiriesData.inquiries || []);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/settings"
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sales</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeSales}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Offers</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeOffers}</p>
                </div>
                <Tags className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link 
              href="/admin/products/add"
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <Package className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add Product</span>
            </Link>

                         <Link 
               href="/admin/categories"
               className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
             >
               <FolderOpen className="w-8 h-8 text-green-600 mb-2" />
               <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Categories</span>
             </Link>

            <Link 
              href="/admin/collections"
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <Tags className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Collections</span>
            </Link>

            <Link 
              href="/admin/sales"
              className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
            >
              <TrendingUp className="w-8 h-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-700">Sales</span>
            </Link>

            <Link 
              href="/admin/orders"
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
            >
              <ShoppingCart className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Orders</span>
            </Link>

            <Link 
              href="/admin/settings"
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <Settings className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-700">Settings</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link 
                  href="/admin/orders"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent orders</p>
              )}
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Inquiries</h3>
                <Link 
                  href="/admin/inquiries"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentInquiries.length > 0 ? (
                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{inquiry.name}</p>
                          <p className="text-sm text-gray-600">{inquiry.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{inquiry.email}</p>
                        <p className="text-sm text-gray-600">{formatDate(inquiry.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent inquiries</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Categories</p>
                   <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                 </div>
                 <FolderOpen className="w-8 h-8 text-green-500" />
               </div>
             </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Collections</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCollections}</p>
                </div>
                <Tags className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promoters</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPromoters}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
