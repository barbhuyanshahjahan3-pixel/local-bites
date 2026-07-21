import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { City, RestaurantSummary } from '../api/types';
import { Screen } from '../navigation';

export default function HomePage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState<string>(localStorage.getItem('lb_city') || '');
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{ cities: City[] }>('/api/public/cities').then((r) => {
      setCities(r.cities);
      if (!cityId && r.cities[0]) setCityId(r.cities[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!cityId) return;
    localStorage.setItem('lb_city', cityId);
    setLoading(true);
    api
      .get<{ restaurants: RestaurantSummary[] }>(`/api/public/restaurants?cityId=${cityId}`)
      .then((r) => setRestaurants(r.restaurants))
      .finally(() => setLoading(false));
  }, [cityId]);

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Local Bites</h1>
        <select className="input w-auto" value={cityId} onChange={(e) => setCityId(e.target.value)}>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading restaurants…</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {restaurants.map((r) => (
          <button
            key={r._id}
            onClick={() => onNavigate({ name: 'restaurant', id: r._id })}
            className="card text-left hover:border-brand transition-colors"
          >
            {r.coverImageUrl && (
              <img src={r.coverImageUrl} alt={r.name} className="rounded-lg mb-2 h-32 w-full object-cover" />
            )}
            <p className="font-medium text-white">{r.name}</p>
            <p className="text-xs text-slate-500">{r.cuisineTags?.join(', ')}</p>
            {r.ratingCount > 0 && (
              <p className="text-xs text-amber-400 mt-1">
                ★ {r.avgRating.toFixed(1)} ({r.ratingCount})
              </p>
            )}
          </button>
        ))}
        {!loading && restaurants.length === 0 && (
          <p className="text-sm text-slate-500">No restaurants open in this city right now.</p>
        )}
      </div>
    </div>
  );
}
