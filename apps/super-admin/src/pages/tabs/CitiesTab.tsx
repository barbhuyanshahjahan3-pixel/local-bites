import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../api/client';
import { City } from '../../api/types';

export default function CitiesTab() {
  const [cities, setCities] = useState<City[]>([]);
  const [name, setName] = useState('');
  const [state, setState] = useState('Assam');
  const [loading, setLoading] = useState(false);

  const load = () => api.get<{ cities: City[] }>('/api/public/cities').then((r) => setCities(r.cities));

  useEffect(() => {
    load();
  }, []);

  const addCity = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/superadmin/cities', { name, state });
      setName('');
      await load();
    } finally {
      setLoading(false);
    }
  };

  const removeCity = async (id: string) => {
    if (!confirm('Deactivate this city? Existing data is preserved.')) return;
    await api.delete(`/api/superadmin/cities/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addCity} className="card flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="label">City name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="label">State</label>
          <input className="input" value={state} onChange={(e) => setState(e.target.value)} />
        </div>
        <button className="btn-primary" disabled={loading}>
          Add city
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((c) => (
          <div key={c._id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-white">{c.name}</p>
              <p className="text-xs text-slate-500">{c.state}</p>
            </div>
            <button className="btn-ghost text-sm" onClick={() => removeCity(c._id)}>
              Deactivate
            </button>
          </div>
        ))}
        {cities.length === 0 && (
          <p className="text-sm text-slate-500">No cities yet — add Hojai to get started.</p>
        )}
      </div>
    </div>
  );
}
