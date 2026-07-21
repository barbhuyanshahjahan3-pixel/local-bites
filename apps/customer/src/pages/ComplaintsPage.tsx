import { useEffect, useState, FormEvent } from 'react';
import { api } from '../api/client';
import { Complaint } from '../api/types';

const STATUS_COLOR: Record<string, string> = {
  open: 'bg-amber-500/20 text-amber-300',
  in_progress: 'bg-blue-500/20 text-blue-300',
  resolved: 'bg-emerald-500/20 text-emerald-300',
  closed: 'bg-slate-700 text-slate-400',
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () =>
    api.get<{ complaints: Complaint[] }>('/api/customer/complaints/mine').then((r) => setComplaints(r.complaints));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/customer/complaints', { subject, description });
      setSubject('');
      setDescription('');
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <h1 className="text-xl font-semibold text-white">Support</h1>

      <form onSubmit={submit} className="card space-y-3">
        <h2 className="font-semibold text-white">File a complaint</h2>
        <div>
          <label className="label">Subject</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label className="label">Details</label>
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit'}
        </button>
      </form>

      <div className="space-y-2">
        {complaints.map((c) => (
          <div key={c._id} className="card">
            <div className="flex items-center justify-between">
              <p className="font-medium text-white">{c.subject}</p>
              <span className={`badge ${STATUS_COLOR[c.status] || 'bg-slate-700 text-slate-300'}`}>
                {c.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{c.description}</p>
            {c.resolutionNote && <p className="text-sm text-emerald-400 mt-1">Resolution: {c.resolutionNote}</p>}
          </div>
        ))}
        {complaints.length === 0 && <p className="text-sm text-slate-500">No complaints filed.</p>}
      </div>
    </div>
  );
}
