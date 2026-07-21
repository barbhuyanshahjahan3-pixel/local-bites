import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useCustomerSocket } from '../hooks/useCustomerSocket';
import { Screen } from '../navigation';

interface StatusEvent {
  status: string;
  at: string;
  by?: string;
  note?: string;
}

interface OrderFull {
  _id: string;
  orderNumber: string;
  items: { name: string; price: number; quantity: number }[];
  itemsTotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  statusHistory: StatusEvent[];
  restaurant: { _id: string; name: string };
}

const STATUS_LABEL: Record<string, string> = {
  placed: 'Order placed',
  restaurant_accepted: 'Accepted by restaurant',
  preparing: 'Preparing your food',
  ready_for_pickup: 'Ready for pickup',
  delivery_accepted: 'Rider assigned',
  picked_up: 'Picked up by rider',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  restaurant_rejected: 'Rejected by restaurant',
  delivery_rejected: 'Re-queued for a new rider',
  cancelled: 'Cancelled',
};

export default function OrderDetailPage({ orderId }: { orderId: string; onNavigate: (s: Screen) => void }) {
  const [order, setOrder] = useState<OrderFull | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  const load = () =>
    api.get<{ order: OrderFull }>(`/api/customer/orders/mine/${orderId}`).then((r) => setOrder(r.order));

  useEffect(() => {
    load();
  }, [orderId]);

  useCustomerSocket((payload) => {
    if (payload.orderId === orderId) load();
  });

  const submitReview = async () => {
    if (!order) return;
    await api.post('/api/customer/reviews', {
      restaurantId: order.restaurant._id,
      orderId: order._id,
      rating,
      comment,
    });
    setReviewSent(true);
  };

  if (!order) return <p className="px-4 py-6 text-sm text-slate-500">Loading…</p>;

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-semibold text-white">{order.orderNumber}</h1>
        <p className="text-sm text-slate-400">{order.restaurant?.name}</p>
      </div>

      <div className="card space-y-2">
        {order.statusHistory.map((ev, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-brand mt-1.5 shrink-0" />
            <div>
              <p className="text-sm text-slate-200">{STATUS_LABEL[ev.status] || ev.status}</p>
              <p className="text-xs text-slate-500">{new Date(ev.at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card space-y-1">
        <h2 className="font-semibold text-white mb-1">Items</h2>
        {order.items.map((it, i) => (
          <p key={i} className="text-sm text-slate-400">
            {it.quantity} × {it.name} — ₹{it.price * it.quantity}
          </p>
        ))}
        <div className="border-t border-slate-800 mt-2 pt-2 text-sm text-slate-300 space-y-1">
          <p>Items total: ₹{order.itemsTotal}</p>
          <p>Delivery: ₹{order.deliveryCharge}</p>
          <p className="font-semibold text-white">Total: ₹{order.grandTotal}</p>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
        </p>
      </div>

      {order.status === 'delivered' && !reviewSent && (
        <div className="card space-y-2">
          <h2 className="font-semibold text-white">Rate this order</h2>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-amber-400' : 'text-slate-600'}>
                ★
              </button>
            ))}
          </div>
          <textarea
            className="input"
            placeholder="Optional comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn-primary w-full" onClick={submitReview}>
            Submit review
          </button>
        </div>
      )}
      {reviewSent && <p className="text-sm text-emerald-400">Thanks for your review!</p>}
    </div>
  );
}
