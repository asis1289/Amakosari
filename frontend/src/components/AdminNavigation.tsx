'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Package, 
  TrendingUp, 
  Tag, 
  FolderOpen as CollectionsIcon, 
  Settings,
  Users,
  ShoppingCart,
  Mail,
  Bell,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface AdminNavigationProps {
  className?: string;
}

interface Notification {
  id: number;
  message: string;
  link: string;
  time: string;
}

export default function AdminNavigation({ className = '' }: AdminNavigationProps) {
  const pathname = usePathname();
  const [unreadEnquiries, setUnreadEnquiries] = useState(0);
  const prevUnreadRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); // Poll every 10s
    // Socket.io for real-time inquiry notification
    const token = localStorage.getItem('token');
    let socket: Socket | null = null;
    if (token) {
      socket = io('http://localhost:3001', { transports: ['websocket'] });
      socket.on('new-inquiry', (inquiry) => {
        if (audioRef.current) audioRef.current.play();
        setNotifications((prev) => [
          {
            id: Date.now(),
            message: 'You have a new enquiry — check',
            link: '/admin/inquiries',
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 4)
        ]);
        setHasUnreadNotification(true);
      });
    }
    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, []);

  const fetchUnread = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/inquiries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (typeof data.unreadCount === 'number') {
          // Play sound if unread count increases
          if (data.unreadCount > prevUnreadRef.current && prevUnreadRef.current !== 0) {
            if (audioRef.current) audioRef.current.play();
          }
          prevUnreadRef.current = data.unreadCount;
          setUnreadEnquiries(data.unreadCount);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const handleBellClick = () => {
    setDropdownOpen((open) => !open);
    setHasUnreadNotification(false);
  };

  const handleNotificationClick = (link: string) => {
    setDropdownOpen(false);
    setHasUnreadNotification(false);
    window.location.href = link;
  };

  const menuItems = [
    {
      name: 'Overview',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Dashboard overview'
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: FolderOpen,
      description: 'Manage categories'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      description: 'Manage products'
    },
    {
      name: 'Sales',
      href: '/admin/sales',
      icon: TrendingUp,
      description: 'Manage sales'
    },
    {
      name: 'Offers',
      href: '/admin/offers',
      icon: Tag,
      description: 'Manage offers'
    },
    {
      name: 'Collections',
      href: '/admin/collections',
      icon: CollectionsIcon,
      description: 'Manage collections'
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      description: 'Manage orders'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      description: 'Manage users'
    },
    {
      name: 'Enquiries',
      href: '/admin/inquiries',
      icon: Mail,
      description: 'Customer enquiries',
      badge: unreadEnquiries
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Site settings'
    }
  ];

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex space-x-8 py-4 overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 border border-blue-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title={item.description}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white absolute -top-2 -right-2">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        {/* Notification Bell */}
        <div className="relative ml-4">
          <button
            className="relative p-2 rounded-full hover:bg-blue-50 focus:outline-none"
            onClick={handleBellClick}
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6 text-blue-600" />
            {hasUnreadNotification && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold text-gray-700">Notifications</span>
                <button onClick={() => setDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <li className="px-4 py-4 text-gray-500 text-center">No notifications</li>
                ) : (
                  notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center space-x-3"
                      onClick={() => handleNotificationClick(notif.link)}
                    >
                      <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-800">{notif.message}</div>
                        <div className="text-xs text-gray-400">{notif.time}</div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 