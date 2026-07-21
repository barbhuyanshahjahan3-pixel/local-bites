import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { OrderSummary } from '../api/types';
import { Screen } from '../navigation';

const STATUS_LABEL: Record<string, string> = {
  placed: 'Placed',
  restaurant_accepted: 'Accepted by restaurant',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for pickup',
  delivery_accepted: 'Rider assigned',
  picked_up: 'Picked up',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  restaurant_rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export default function OrdersPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    api.get<{ orders: OrderSummary[] }>('/api/customer/orders/mine').then((r) => setOrders(r.orders));
  }, []);

  return (
    <div className="px-4 py-4 space-y-3 pb-24">
      <h1 className="text-xl font-semibold text-white">Your orders</h1>
      {orders.map((o) => (
        <button
          key={o._id}
          className="card w-full text-left"
          onClick={() => onNavigate({ name: 'orderDetail', id: o._id })}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium text-white">{o.orderNumber}</p>
            <span className="badge bg-slate-800 text-slate-300">{STATUS_LABEL[o.status] || o.status}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">₹{o.grandTotal} · {new Date(o.createdAt).toLocaleDateString()}</p>
        </button>
      ))}
      {orders.length === 0 && <p className="text-sm text-slate-500">No orders yet.</p>}
    </div>
  );
}
