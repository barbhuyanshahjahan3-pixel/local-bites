import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../api/client';
import { Admin, Credentials } from '../../api/types';
import CredentialsModal from '../../components/CredentialsModal';

export default function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const load = () => api.get<{ admins: Admin[] }>('/api/superadmin/admins').then((r) => setAdmins(r.admins));

  useEffect(() => {
    load();
  }, []);

  const createAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ credentials: Credentials }>('/api/superadmin/admins', form);
      setForm({ name: '', email: '' });
      setCredentials(res.credentials);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const disableAdmin = async (id: string) => {
    await api.patch(`/api/superadmin/admins/${id}/disable`);
    await load();
  };

  const removeAdmin = async (id: string) => {
    if (!confirm('Remove this admin permanently?')) return;
    await api.delete(`/api/superadmin/admins/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={createAdmin} className="card space-y-3">
        <h2 className="font-semibold text-white">Add admin</h2>
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
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create admin account'}
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {admins.map((a) => (
          <div key={a._id} className="card">
            <p className="font-medium text-white">{a.name}</p>
            <p className="text-xs text-slate-500">
              {a.adminId} · {a.email}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${a.isDisabled ? 'text-slate-500' : 'text-emerald-400'}`}>
                {a.isDisabled ? 'Disabled' : 'Active'}
              </span>
              <div className="flex gap-2">
                {!a.isDisabled && (
                  <button className="btn-ghost text-sm" onClick={() => disableAdmin(a._id)}>
                    Disable
                  </button>
                )}
                <button className="btn-ghost text-sm" onClick={() => removeAdmin(a._id)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        {admins.length === 0 && <p className="text-sm text-slate-500">No admins yet.</p>}
      </div>

      {credentials && (
        <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
      )}
    </div>
  );
}
