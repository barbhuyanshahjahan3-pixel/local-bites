import { useEffect, useState } from 'react';
import { api, API_URL } from '../../api/client';
import { HistoryOrder } from '../../api/types';

export default function HistoryTab() {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);

  useEffect(() => {
    api.get<{ orders: HistoryOrder[] }>('/api/delivery/history').then((r) => setOrders(r.orders));
  }, []);

  const downloadPdf = () => {
    const token = localStorage.getItem('lb_delivery_token');
    // Direct navigation with token as a query param would leak it in logs; instead fetch as blob.
    fetch(`${API_URL}/api/delivery/history/export-pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'delivery-history.pdf';
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Delivery history</h2>
        <button className="btn-ghost text-sm" onClick={downloadPdf}>
          Export PDF
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((o) => (
          <div key={o._id} className="card">
            <p className="font-medium text-white">{o.orderNumber}</p>
            <p className="text-sm text-slate-400">{new Date(o.deliveredAt).toLocaleString()}</p>
            <p className="text-sm text-slate-300 mt-1">Earned ₹{o.deliveryCharge}</p>
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-slate-500">No completed deliveries yet.</p>}
      </div>
    </div>
  );
}
