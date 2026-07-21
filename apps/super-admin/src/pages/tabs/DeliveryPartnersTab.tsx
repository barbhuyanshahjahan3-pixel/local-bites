import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../api/client';
import { City, DeliveryPartner, Credentials } from '../../api/types';
import CredentialsModal from '../../components/CredentialsModal';

export default function DeliveryPartnersTab() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [form, setForm] = useState({ name: '', mobile: '', cityId: '', vehicleType: 'bike' });
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const load = async () => {
    const [p, c] = await Promise.all([
      api.get<{ partners: DeliveryPartner[] }>('/api/admin/delivery-partners'),
      api.get<{ cities: City[] }>('/api/public/cities'),
    ]);
    setPartners(p.partners);
    setCities(c.cities);
  };

  useEffect(() => {
    load();
  }, []);

  const createPartner = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ credentials: Credentials }>('/api/superadmin/delivery-partners', form);
      setForm({ name: '', mobile: '', cityId: '', vehicleType: 'bike' });
      setCredentials(res.credentials);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const removePartner = async (id: string) => {
    if (!confirm('Remove this delivery partner permanently?')) return;
    await api.delete(`/api/superadmin/delivery-partners/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={createPartner} className="card space-y-3">
        <h2 className="font-semibold text-white">Add delivery partner</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Mobile</label>
            <input
              className="input"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">City</label>
            <select
              className="input"
              value={form.cityId}
              onChange={(e) => setForm({ ...form, cityId: e.target.value })}
              required
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Vehicle</label>
            <select
              className="input"
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            >
              <option value="bike">Bike</option>
              <option value="bicycle">Bicycle</option>
              <option value="on-foot">On foot</option>
            </select>
          </div>
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create delivery partner account'}
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => (
          <div key={p._id} className="card">
            <p className="font-medium text-white">{p.name}</p>
            <p className="text-xs text-slate-500">{p.partnerId}</p>
            <p className="text-sm text-slate-400 mt-1">{p.mobile} · {p.vehicleType}</p>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${p.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                {p.isOnline ? 'Online' : 'Offline'}
              </span>
              <button className="btn-ghost text-sm" onClick={() => removePartner(p._id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {credentials && (
        <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
      )}
    </div>
  );
}
