import { useState, FormEvent } from 'react';
import { api } from '../api/client';
import { Food, RestaurantSummary } from '../api/types';
import { Screen } from '../navigation';

export default function SearchPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const [f, r] = await Promise.all([
        api.get<{ foods: Food[] }>(`/api/public/foods/search?q=${encodeURIComponent(query)}`),
        api.get<{ restaurants: RestaurantSummary[] }>(`/api/public/restaurants?search=${encodeURIComponent(query)}`),
      ]);
      setFoods(f.foods);
      setRestaurants(r.restaurants);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-5 pb-24">
      <form onSubmit={search} className="flex gap-2">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food or restaurants…"
        />
        <button className="btn-primary">Go</button>
      </form>

      {loading && <p className="text-sm text-slate-500">Searching…</p>}

      {restaurants.length > 0 && (
        <section>
          <h2 className="font-semibold text-white mb-2">Restaurants</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {restaurants.map((r) => (
              <button
                key={r._id}
                className="card text-left"
                onClick={() => onNavigate({ name: 'restaurant', id: r._id })}
              >
                <p className="font-medium text-white">{r.name}</p>
                <p className="text-xs text-slate-500">{r.cuisineTags?.join(', ')}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {foods.length > 0 && (
        <section>
          <h2 className="font-semibold text-white mb-2">Food</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {foods.map((f) => {
              const restaurantId = typeof f.restaurant === 'string' ? f.restaurant : f.restaurant._id;
              return (
                <button
                  key={f._id}
                  className="card text-left"
                  onClick={() => onNavigate({ name: 'restaurant', id: restaurantId })}
                >
                  {f.imageUrl && (
                    <img src={f.imageUrl} alt={f.name} className="rounded-lg mb-2 h-24 w-full object-cover" />
                  )}
                  <p className="font-medium text-white">{f.name}</p>
                  <p className="text-sm text-slate-400">₹{f.offerPrice ?? f.price}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {searched && !loading && foods.length === 0 && restaurants.length === 0 && (
        <p className="text-sm text-slate-500">No results for "{query}".</p>
      )}
    </div>
  );
}
