import { useState, FormEvent } from 'react';
import { api } from '../../api/client';

export default function SettingsTab() {
  const [form, setForm] = useState({
    defaultCommissionPercent: 15,
    defaultDeliveryCharge: 30,
    codEnabled: true,
    razorpayEnabled: true,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await api.patch('/api/superadmin/settings', form);
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="card max-w-lg space-y-4">
      <h2 className="font-semibold text-white">Platform settings</h2>
      {saved && <p className="text-sm text-emerald-400">Settings saved.</p>}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Default commission (%)</label>
          <input
            type="number"
            className="input"
            value={form.defaultCommissionPercent}
            onChange={(e) => setForm({ ...form, defaultCommissionPercent: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">Default delivery charge (₹)</label>
          <input
            type="number"
            className="input"
            value={form.defaultDeliveryCharge}
            onChange={(e) => setForm({ ...form, defaultDeliveryCharge: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.codEnabled}
            onChange={(e) => setForm({ ...form, codEnabled: e.target.checked })}
          />
          Cash on Delivery enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.razorpayEnabled}
            onChange={(e) => setForm({ ...form, razorpayEnabled: e.target.checked })}
          />
          Online payment enabled
        </label>
      </div>

      <button className="btn-primary" disabled={loading}>
        {loading ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
