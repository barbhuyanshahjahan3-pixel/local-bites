import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { AdminDeliveryPartner } from '../../api/types';

export default function DeliveryPartnersTab() {
  const [partners, setPartners] = useState<AdminDeliveryPartner[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminDeliveryPartner>>({});

  const load = () =>
    api.get<{ partners: AdminDeliveryPartner[] }>('/api/admin/delivery-partners').then((r) => setPartners(r.partners));

  useEffect(() => {
    load();
  }, []);

  const startEdit = (p: AdminDeliveryPartner) => {
    setEditing(p._id);
    setForm({ name: p.name, mobile: p.mobile, vehicleType: p.vehicleType, isDisabled: p.isDisabled });
  };

  const save = async (id: string) => {
    await api.patch(`/api/admin/delivery-partners/${id}`, form);
    setEditing(null);
    await load();
  };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-white">Delivery partners</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => (
          <div key={p._id} className="card space-y-2">
            {editing === p._id ? (
              <>
                <input
                  className="input"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className="input"
                  value={form.mobile || ''}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
                <select
                  className="input"
                  value={form.vehicleType || 'bike'}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                >
                  <option value="bike">Bike</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="on-foot">On foot</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isDisabled ?? false}
                    onChange={(e) => setForm({ ...form, isDisabled: e.target.checked })}
                  />
                  Disabled
                </label>
                <div className="flex gap-2">
                  <button className="btn-primary text-sm flex-1" onClick={() => save(p._id)}>
                    Save
                  </button>
                  <button className="btn-ghost text-sm flex-1" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-medium text-white">{p.name}</p>
                <p className="text-xs text-slate-500">{p.partnerId}</p>
                <p className="text-sm text-slate-400">{p.mobile} · {p.vehicleType}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${p.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {p.isOnline ? 'Online' : 'Offline'}
                    {p.isDisabled ? ' · Disabled' : ''}
                  </span>
                  <button className="btn-ghost text-sm" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
