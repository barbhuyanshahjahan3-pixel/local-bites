import { useState, FormEvent } from 'react';
import { api } from '../../api/client';
import { SalesReport } from '../../api/types';

export default function ReportsTab() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);

  const runReport = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await api.get<{ report: SalesReport }>(`/api/restaurant/reports/sales?${params}`);
      setReport(res.report);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <form onSubmit={runReport} className="card space-y-3">
        <h2 className="font-semibold text-white">Sales report</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Loading…' : 'Run report'}
        </button>
      </form>

      {report && (
        <div className="card space-y-2">
          <Row label="Delivered orders" value={report.orderCount} />
          <Row label="Gross revenue" value={`₹${report.totalRevenue}`} />
          <Row label="Platform commission" value={`₹${report.totalCommission}`} />
          <Row label="Net payout" value={`₹${report.netPayout}`} strong />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string | number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={strong ? 'text-white font-semibold' : 'text-slate-200'}>{value}</span>
    </div>
  );
}
