import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useDeliverySocket } from '../../hooks/useDeliverySocket';

interface AvailableOrder {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  deliveryCharge: number;
  paymentMethod: string;
  restaurant: { name: string; address: string };
}

export default function AvailableTab({ onAccepted }: { onAccepted: () => void }) {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () =>
    api.get<{ orders: AvailableOrder[] }>('/api/delivery/available-orders').then((r) => setOrders(r.orders));

  useEffect(() => {
    load();
  }, []);

  useDeliverySocket(profile?.city || null, {
    onDeliveryAvailable: () => load(),
  });

  const accept = async (id: string) => {
    setBusyId(id);
    try {
      await api.patch(`/api/delivery/orders/${id}/status`, { action: 'accept' });
      await load();
      onAccepted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not accept — it may already be taken');
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-white">Available deliveries</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((o) => (
          <div key={o._id} className="card space-y-1">
            <p className="font-medium text-white">{o.orderNumber}</p>
            <p className="text-sm text-slate-400">{o.restaurant?.name}</p>
            <p className="text-xs text-slate-500">{o.restaurant?.address}</p>
            <p className="text-sm text-slate-300">
              Order ₹{o.grandTotal} · Earn ₹{o.deliveryCharge}
            </p>
            <button className="btn-primary w-full text-sm mt-2" disabled={busyId === o._id} onClick={() => accept(o._id)}>
              {busyId === o._id ? 'Accepting…' : 'Accept delivery'}
            </button>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-slate-500">No deliveries waiting right now. Stay online — new ones appear automatically.</p>
        )}
      </div>
    </div>
  );
}
