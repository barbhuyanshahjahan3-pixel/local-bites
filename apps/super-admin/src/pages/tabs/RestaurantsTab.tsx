import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../api/client';
import { City, Restaurant, Credentials } from '../../api/types';
import CredentialsModal from '../../components/CredentialsModal';

export default function RestaurantsTab() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [form, setForm] = useState({ name: '', cityId: '', address: '', contactPhone: '' });
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const load = async () => {
    const [r, c] = await Promise.all([
      api.get<{ restaurants: Restaurant[] }>('/api/admin/restaurants'),
      api.get<{ cities: City[] }>('/api/public/cities'),
    ]);
    setRestaurants(r.restaurants);
    setCities(c.cities);
  };

  useEffect(() => {
    load();
  }, []);

  const createRestaurant = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ credentials: Credentials }>('/api/superadmin/restaurants', form);
      setForm({ name: '', cityId: '', address: '', contactPhone: '' });
      setCredentials(res.credentials);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const removeRestaurant = async (id: string) => {
    if (!confirm('Remove this restaurant permanently?')) return;
    await api.delete(`/api/superadmin/restaurants/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={createRestaurant} className="card space-y-3">
        <h2 className="font-semibold text-white">Add restaurant</h2>
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
            <label className="label">Address</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Contact phone</label>
            <input
              className="input"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              required
            />
          </div>
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create restaurant account'}
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((r) => (
          <div key={r._id} className="card">
            <p className="font-medium text-white">{r.name}</p>
            <p className="text-xs text-slate-500">{r.restaurantId}</p>
            <p className="text-sm text-slate-400 mt-1">{r.address}</p>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${r.isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                {r.isOpen ? 'Open' : 'Closed'}
              </span>
              <button className="btn-ghost text-sm" onClick={() => removeRestaurant(r._id)}>
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
