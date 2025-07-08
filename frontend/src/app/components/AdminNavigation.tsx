import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AdminNavigation() {
  const [pendingOrders, setPendingOrders] = useState(0);
  const prevPendingOrders = useRef(0);
  const orderAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPendingOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3001/api/orders?status=PENDING', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const count = data.orders ? data.orders.length : 0;
      setPendingOrders(count);
      if (count > prevPendingOrders.current) {
        orderAudioRef.current?.play();
      }
      prevPendingOrders.current = count;
    }
  };

  return (
    <>
      <audio ref={orderAudioRef} src="/order-notification.mp3" preload="auto" />
      <nav>
        <Link href="/admin/orders" className="relative flex items-center">
          Orders
          {pendingOrders > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
              {pendingOrders}
            </span>
          )}
        </Link>
      </nav>
    </>
  );
} 