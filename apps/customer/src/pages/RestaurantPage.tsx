import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Food, RestaurantDetail } from '../api/types';
import { useCart } from '../context/CartContext';
import { Screen } from '../navigation';

export default function RestaurantPage({
  restaurantId,
  onNavigate,
}: {
  restaurantId: string;
  onNavigate: (s: Screen) => void;
}) {
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const { addItem, lines } = useCart();

  useEffect(() => {
    api
      .get<{ restaurant: RestaurantDetail; foods: Food[] }>(`/api/public/restaurants/${restaurantId}`)
      .then((r) => {
        setRestaurant(r.restaurant);
        setFoods(r.foods);
      });
  }, [restaurantId]);

  const toggleWishlist = async (foodId: string) => {
    await api.post(`/api/customer/wishlist/${foodId}`);
  };

  const quantityOf = (foodId: string) => lines.find((l) => l.food._id === foodId)?.quantity || 0;

  const grouped = foods.reduce<Record<string, Food[]>>((acc, f) => {
    const catName = typeof f.category === 'string' ? 'Menu' : f.category.name;
    (acc[catName] ||= []).push(f);
    return acc;
  }, {});

  if (!restaurant) return <p className="px-4 py-6 text-sm text-slate-500">Loading…</p>;

  return (
    <div className="pb-24">
      <button className="px-4 py-3 text-sm text-slate-400" onClick={() => onNavigate({ name: 'home' })}>
        ← Back
      </button>

      {restaurant.coverImageUrl && (
        <img src={restaurant.coverImageUrl} alt={restaurant.name} className="w-full h-40 object-cover" />
      )}
      <div className="px-4 py-3">
        <h1 className="text-xl font-semibold text-white">{restaurant.name}</h1>
        <p className="text-sm text-slate-400">{restaurant.description}</p>
        <p className="text-xs text-slate-500 mt-1">{restaurant.address}</p>
        {restaurant.ratingCount > 0 && (
          <p className="text-xs text-amber-400 mt-1">
            ★ {restaurant.avgRating.toFixed(1)} ({restaurant.ratingCount} ratings)
          </p>
        )}
        {!restaurant.isOpen && <p className="text-xs text-red-400 mt-1">Currently closed</p>}
      </div>

      {restaurant.galleryImages && restaurant.galleryImages.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="font-semibold text-white mb-2">Gallery</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {restaurant.galleryImages.map((img) => (
              <img
                key={img.publicId}
                src={img.url}
                alt={restaurant.name}
                className="h-28 w-28 rounded-lg object-cover shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {restaurant.lat != null && restaurant.lng != null && (
        <div className="px-4 pb-4">
          <h2 className="font-semibold text-white mb-2">Location</h2>
          <iframe
            title="Restaurant location"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${restaurant.lng - 0.01}%2C${restaurant.lat - 0.01}%2C${restaurant.lng + 0.01}%2C${restaurant.lat + 0.01}&layer=mapnik&marker=${restaurant.lat}%2C${restaurant.lng}`}
            className="w-full h-40 rounded-lg border border-slate-800"
          />
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 text-sm text-brand"
          >
            Get directions →
          </a>
        </div>
      )}

      <div className="px-4 space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="font-semibold text-white mb-2">{category}</h2>
            <div className="space-y-2">
              {items.map((f) => (
                <div key={f._id} className="card flex gap-3">
                  {f.imageUrl && (
                    <img src={f.imageUrl} alt={f.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-white">{f.name}</p>
                      <button className="text-slate-500 hover:text-brand" onClick={() => toggleWishlist(f._id)}>
                        ♡
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">{f.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-slate-300">
                        ₹{f.offerPrice ?? f.price}{' '}
                        {f.offerPrice && <span className="line-through text-slate-600">₹{f.price}</span>}
                      </p>
                      {f.isAvailable ? (
                        quantityOf(f._id) > 0 ? (
                          <span className="badge bg-brand/20 text-brand">{quantityOf(f._id)} in cart</span>
                        ) : (
                          <button className="btn-primary text-sm py-1" onClick={() => addItem(f, restaurant._id)}>
                            Add
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-500">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {lines.length > 0 && (
        <button
          onClick={() => onNavigate({ name: 'cart' })}
          className="fixed bottom-16 inset-x-4 btn-primary shadow-lg"
        >
          View cart ({lines.reduce((s, l) => s + l.quantity, 0)})
        </button>
      )}
    </div>
  );
}
