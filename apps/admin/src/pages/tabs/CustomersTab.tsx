import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { AdminCustomer } from '../../api/types';

export default function CustomersTab() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  useEffect(() => {
    api.get<{ customers: AdminCustomer[] }>('/api/admin/customers').then((r) => setCustomers(r.customers));
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-white">Customers</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <div key={c._id} className="card">
            <p className="font-medium text-white">{c.name}</p>
            <p className="text-sm text-slate-400">{c.mobile}</p>
            {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
          </div>
        ))}
        {customers.length === 0 && <p className="text-sm text-slate-500">No customers yet.</p>}
      </div>
    </div>
  );
}
