import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Food } from '../api/types';
import { Screen } from '../navigation';

export default function WishlistPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [items, setItems] = useState<Food[]>([]);

  const load = () => api.get<{ wishlist: Food[] }>('/api/customer/wishlist').then((r) => setItems(r.wishlist));

  useEffect(() => {
    load();
  }, []);

  const remove = async (foodId: string) => {
    await api.post(`/api/customer/wishlist/${foodId}`); // toggle removes if already present
    await load();
  };

  return (
    <div className="px-4 py-4 space-y-3 pb-24">
      <h1 className="text-xl font-semibold text-white">Wishlist</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((f) => {
          const restaurantId = typeof f.restaurant === 'string' ? f.restaurant : f.restaurant._id;
          return (
            <div key={f._id} className="card">
              {f.imageUrl && <img src={f.imageUrl} alt={f.name} className="rounded-lg mb-2 h-28 w-full object-cover" />}
              <p className="font-medium text-white">{f.name}</p>
              <p className="text-sm text-slate-400">₹{f.offerPrice ?? f.price}</p>
              <div className="flex gap-2 mt-2">
                <button
                  className="btn-primary flex-1 text-sm"
                  onClick={() => onNavigate({ name: 'restaurant', id: restaurantId })}
                >
                  View
                </button>
                <button className="btn-ghost text-sm" onClick={() => remove(f._id)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-slate-500">Nothing saved yet.</p>}
      </div>
    </div>
  );
}
