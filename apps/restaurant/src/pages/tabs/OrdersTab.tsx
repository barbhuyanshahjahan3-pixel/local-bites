import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { RestaurantOrder } from '../../api/types';
import { useRestaurantSocket } from '../../hooks/useRestaurantSocket';

const STATUS_LABEL: Record<string, string> = {
  placed: 'New',
  restaurant_accepted: 'Accepted',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for pickup',
  restaurant_rejected: 'Rejected',
  delivery_accepted: 'Picked up by rider',
  picked_up: 'Picked up by rider',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-amber-500/20 text-amber-300',
  restaurant_accepted: 'bg-blue-500/20 text-blue-300',
  preparing: 'bg-blue-500/20 text-blue-300',
  ready_for_pickup: 'bg-emerald-500/20 text-emerald-300',
  restaurant_rejected: 'bg-red-500/20 text-red-300',
  delivered: 'bg-slate-500/20 text-slate-300',
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const load = () => api.get<{ orders: RestaurantOrder[] }>('/api/restaurant/orders').then((r) => setOrders(r.orders));

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // fallback poll in case a socket event is missed
    return () => clearInterval(interval);
  }, []);

  useRestaurantSocket(() => load());

  const act = async (id: string, action: string, reason?: string) => {
    await api.patch(`/api/restaurant/orders/${id}/status`, { action, reason });
    await load();
  };

  const active = orders.filter((o) => !['delivered', 'cancelled', 'restaurant_rejected'].includes(o.status));
  const past = orders.filter((o) => ['delivered', 'cancelled', 'restaurant_rejected'].includes(o.status));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold text-white mb-3">Active orders</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((o) => (
            <div key={o._id} className="card space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{o.orderNumber}</p>
                <span className={`badge ${STATUS_COLOR[o.status] || 'bg-slate-700 text-slate-300'}`}>
                  {STATUS_LABEL[o.status] || o.status}
                </span>
              </div>
              <ul className="text-sm text-slate-400 space-y-0.5">
                {o.items.map((it, i) => (
                  <li key={i}>
                    {it.quantity} × {it.name}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-slate-300">Total: ₹{o.itemsTotal}</p>
              <p className="text-xs text-slate-500">
                {o.paymentMethod.toUpperCase()} · {o.paymentStatus}
              </p>

              {o.status === 'placed' && (
                <div className="flex gap-2 pt-2">
                  <button className="btn-primary flex-1 text-sm" onClick={() => act(o._id, 'accept')}>
                    Accept
                  </button>
                  <button
                    className="btn-ghost flex-1 text-sm"
                    onClick={() => {
                      const reason = rejectReason[o._id] || 'Unable to fulfill';
                      act(o._id, 'reject', reason);
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
              {o.status === 'placed' && (
                <input
                  className="input text-xs"
                  placeholder="Rejection reason (optional)"
                  value={rejectReason[o._id] || ''}
                  onChange={(e) => setRejectReason({ ...rejectReason, [o._id]: e.target.value })}
                />
              )}
              {o.status === 'restaurant_accepted' && (
                <button className="btn-primary w-full text-sm" onClick={() => act(o._id, 'preparing')}>
                  Start preparing
                </button>
              )}
              {o.status === 'preparing' && (
                <button className="btn-primary w-full text-sm" onClick={() => act(o._id, 'ready')}>
                  Mark ready for pickup
                </button>
              )}
            </div>
          ))}
          {active.length === 0 && <p className="text-sm text-slate-500">No active orders right now.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-white mb-3">Order history</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {past.map((o) => (
            <div key={o._id} className="card opacity-70">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{o.orderNumber}</p>
                <span className={`badge ${STATUS_COLOR[o.status] || 'bg-slate-700 text-slate-300'}`}>
                  {STATUS_LABEL[o.status] || o.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">₹{o.itemsTotal}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
