import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { OrderAnalytics, PerformanceRow } from '../../api/types';

export default function AnalyticsTab() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [totals, setTotals] = useState<OrderAnalytics | null>(null);
  const [restaurantPerf, setRestaurantPerf] = useState<PerformanceRow[]>([]);
  const [deliveryPerf, setDeliveryPerf] = useState<PerformanceRow[]>([]);

  useEffect(() => {
    api
      .get<{ totals: OrderAnalytics }>(`/api/admin/analytics/orders?period=${period}`)
      .then((r) => setTotals(r.totals));
  }, [period]);

  useEffect(() => {
    api
      .get<{ results: PerformanceRow[] }>('/api/admin/analytics/restaurant-performance')
      .then((r) => setRestaurantPerf(r.results));
    api
      .get<{ results: PerformanceRow[] }>('/api/admin/analytics/delivery-performance')
      .then((r) => setDeliveryPerf(r.results));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-white">Order analytics</h2>
        <select className="input w-auto" value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {totals && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Stat label="Total orders" value={totals.orderCount} />
          <Stat label="Delivered" value={totals.delivered} />
          <Stat label="Cancelled" value={totals.cancelled} />
          <Stat label="Rejected" value={totals.rejected} />
          <Stat label="Rejected by restaurant" value={totals.rejectedByRestaurant} />
          <Stat label="Rejected by rider" value={totals.rejectedByDelivery} />
          <Stat label="Revenue" value={`₹${totals.revenue}`} />
          <Stat label="Commission" value={`₹${totals.platformCommission}`} />
          <Stat label="Delivery charges" value={`₹${totals.deliveryCharges}`} />
          <Stat label="Profit & loss" value={`₹${totals.profitAndLoss}`} strong />
        </div>
      )}

      <section>
        <h2 className="font-semibold text-white mb-2">Restaurant performance</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {restaurantPerf.map((r, i) => (
            <div key={i} className="card">
              <p className="font-medium text-white">{r.name}</p>
              <p className="text-sm text-slate-400">
                {r.orderCount} orders · ₹{r.revenue} revenue · ₹{r.commission} commission
              </p>
            </div>
          ))}
          {restaurantPerf.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-white mb-2">Delivery performance</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deliveryPerf.map((r, i) => (
            <div key={i} className="card">
              <p className="font-medium text-white">{r.name}</p>
              <p className="text-sm text-slate-400">
                {r.deliveries} deliveries · ₹{r.earnings} earned
              </p>
            </div>
          ))}
          {deliveryPerf.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string | number; strong?: boolean }) {
  return (
    <div className="card">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={strong ? 'text-xl font-semibold text-white' : 'text-lg text-slate-200'}>{value}</p>
    </div>
  );
}
