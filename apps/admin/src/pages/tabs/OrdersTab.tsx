import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { AdminOrder } from '../../api/types';

const STATUS_OPTIONS = [
  '',
  'placed',
  'restaurant_accepted',
  'preparing',
  'ready_for_pickup',
  'delivery_accepted',
  'picked_up',
  'on_the_way',
  'delivered',
  'restaurant_rejected',
  'delivery_rejected',
  'cancelled',
];

export default function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState('');
  const [overrideTarget, setOverrideTarget] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState('preparing');
  const [reassignTarget, setReassignTarget] = useState<string | null>(null);
  const [newPartnerId, setNewPartnerId] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    api.get<{ orders: AdminOrder[] }>(`/api/admin/orders?${params}`).then((r) => setOrders(r.orders));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const submitOverride = async (id: string) => {
    await api.patch(`/api/admin/orders/${id}/override-status`, { status: overrideStatus, note: 'Admin override' });
    setOverrideTarget(null);
    load();
  };

  const submitReassign = async (id: string) => {
    if (!newPartnerId) return;
    await api.patch(`/api/admin/orders/${id}/reassign-delivery`, { newPartnerId });
    setReassignTarget(null);
    setNewPartnerId('');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-white">Orders</h2>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s || 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((o) => (
          <div key={o._id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-white">{o.orderNumber}</p>
              <span className="badge bg-slate-800 text-slate-300">{o.status.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-sm text-slate-400">₹{o.grandTotal}</p>
            {o.rejectedBy && <p className="text-xs text-red-400">Rejected by: {o.rejectedBy}</p>}

            <div className="flex gap-2 pt-1">
              <button className="btn-ghost text-xs flex-1" onClick={() => setOverrideTarget(o._id)}>
                Override status
              </button>
              <button className="btn-ghost text-xs flex-1" onClick={() => setReassignTarget(o._id)}>
                Reassign rider
              </button>
            </div>

            {overrideTarget === o._id && (
              <div className="flex gap-2">
                <select className="input" value={overrideStatus} onChange={(e) => setOverrideStatus(e.target.value)}>
                  {STATUS_OPTIONS.filter(Boolean).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button className="btn-primary text-xs" onClick={() => submitOverride(o._id)}>
                  Apply
                </button>
              </div>
            )}

            {reassignTarget === o._id && (
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="New partner ID"
                  value={newPartnerId}
                  onChange={(e) => setNewPartnerId(e.target.value)}
                />
                <button className="btn-primary text-xs" onClick={() => submitReassign(o._id)}>
                  Apply
                </button>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-slate-500">No orders match this filter.</p>}
      </div>
    </div>
  );
}
