import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Complaint } from '../../api/types';

export default function ComplaintsTab() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = () =>
    api.get<{ complaints: Complaint[] }>('/api/admin/complaints').then((r) => setComplaints(r.complaints));

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: string, status: string) => {
    await api.patch(`/api/admin/complaints/${id}`, { status, resolutionNote: notes[id] || '' });
    await load();
  };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-white">Complaints</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {complaints.map((c) => (
          <div key={c._id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-white">{c.subject}</p>
              <span className="badge bg-slate-800 text-slate-300">{c.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-slate-400">{c.description}</p>
            {c.status !== 'resolved' && c.status !== 'closed' && (
              <>
                <textarea
                  className="input"
                  placeholder="Resolution note"
                  value={notes[c._id] || ''}
                  onChange={(e) => setNotes({ ...notes, [c._id]: e.target.value })}
                />
                <div className="flex gap-2">
                  <button className="btn-primary text-sm flex-1" onClick={() => resolve(c._id, 'in_progress')}>
                    Mark in progress
                  </button>
                  <button className="btn-primary text-sm flex-1" onClick={() => resolve(c._id, 'resolved')}>
                    Resolve
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {complaints.length === 0 && <p className="text-sm text-slate-500">No complaints filed.</p>}
      </div>
    </div>
  );
}
