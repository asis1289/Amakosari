import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  product?: {
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestAddress: string;
  products: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

export default function GuestOrderConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No tracking token provided.');
      setLoading(false);
      return;
    }
    fetch(`/api/orders/guest/${token}`)
      .then(res => {
        if (!res.ok) throw new Error('Order not found.');
        return res.json();
      })
      .then(data => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) return <div className="p-8 text-center">Loading your order...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!order) return null;

  const address = (() => {
    try {
      return JSON.parse(order.guestAddress);
    } catch {
      return order.guestAddress;
    }
  })();

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Thank you for your order!</h1>
      <p className="mb-2">Dear <b>{order.guestName}</b>, your order has been received and is being processed.</p>
      <p className="mb-2">A confirmation has been sent to <b>{order.guestEmail}</b>.</p>
      <div className="my-4">
        <h2 className="font-semibold mb-1">Shipping Address:</h2>
        <div className="text-sm text-gray-700">
          {typeof address === 'string' ? address : (
            <>
              {address.street}<br/>
              {address.city}, {address.state} {address.zipCode}<br/>
              {address.country}
            </>
          )}
        </div>
      </div>
      <div className="my-4">
        <h2 className="font-semibold mb-1">Order Items:</h2>
        <ul className="divide-y divide-gray-200">
          {order.products.map((item, idx) => (
            <li key={idx} className="py-2 flex items-center">
              {item.product?.imageUrl && (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 object-cover rounded mr-3" />
              )}
              <div>
                <div className="font-medium">{item.product?.name || 'Product'}</div>
                <div className="text-xs text-gray-500">Qty: {item.quantity} | Price: ${item.price.toFixed(2)}</div>
                {item.size && <div className="text-xs">Size: {item.size}</div>}
                {item.color && <div className="text-xs">Color: {item.color}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="my-4 text-right font-bold text-lg">
        Total: ${order.totalAmount.toFixed(2)}
      </div>
      <div className="mt-6 text-center text-gray-700">
        <p>If you have any questions, please <a href="/contact" className="text-blue-600 underline">contact us</a>.</p>
        <p className="mt-2">You can track your order using the link sent to your email.</p>
      </div>
    </div>
  );
} 