import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CitiesTab from './tabs/CitiesTab';
import RestaurantsTab from './tabs/RestaurantsTab';
import DeliveryPartnersTab from './tabs/DeliveryPartnersTab';
import AdminsTab from './tabs/AdminsTab';
import SettingsTab from './tabs/SettingsTab';

const TABS = [
  { id: 'cities', label: 'Cities', Component: CitiesTab },
  { id: 'restaurants', label: 'Restaurants', Component: RestaurantsTab },
  { id: 'delivery', label: 'Delivery Partners', Component: DeliveryPartnersTab },
  { id: 'admins', label: 'Admins', Component: AdminsTab },
  { id: 'settings', label: 'Settings', Component: SettingsTab },
] as const;

export default function DashboardPage() {
  const { logout, profile } = useAuth();
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('cities');
  const ActiveComponent = TABS.find((t) => t.id === active)!.Component;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Local Bites — Super Admin</h1>
          {profile && <p className="text-xs text-slate-500">{profile.name}</p>}
        </div>
        <button className="btn-ghost text-sm" onClick={logout}>
          Log out
        </button>
      </header>

      <nav className="px-4 sm:px-8 py-3 flex gap-2 overflow-x-auto border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              active === t.id ? 'bg-brand text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="px-4 sm:px-8 py-6">
        <ActiveComponent />
      </main>
    </div>
  );
}
