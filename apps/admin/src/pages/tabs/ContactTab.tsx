import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../api/client';

export default function ContactTab() {
  const [form, setForm] = useState({
    phone: '',
    supportEmail: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{ contact: typeof form }>('/api/public/contact').then((r) => {
      if (r.contact) setForm({ ...form, ...r.contact });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await api.patch('/api/admin/contact', form);
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="card max-w-lg space-y-3">
      <h2 className="font-semibold text-white">Contact information</h2>
      <p className="text-sm text-slate-400">Shown to customers across the platform.</p>
      {saved && <p className="text-sm text-emerald-400">Saved.</p>}

      {(['phone', 'supportEmail', 'facebook', 'instagram', 'whatsapp'] as const).map((field) => (
        <div key={field}>
          <label className="label">{field}</label>
          <input
            className="input"
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        </div>
      ))}

      <button className="btn-primary" disabled={loading}>
        {loading ? 'Saving…' : 'Save contact info'}
      </button>
    </form>
  );
}
