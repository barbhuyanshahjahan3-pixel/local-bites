import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../api/client';
import { Category, Food } from '../../api/types';
import { fileToBase64 } from '../../api/fileToBase64';

export default function MenuTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    isVeg: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [c, f] = await Promise.all([
      api.get<{ categories: Category[] }>('/api/restaurant/categories'),
      api.get<{ foods: Food[] }>('/api/restaurant/foods'),
    ]);
    setCategories(c.categories);
    setFoods(f.foods);
  };

  useEffect(() => {
    load();
  }, []);

  const addCategory = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/api/restaurant/categories', { name: newCategory });
    setNewCategory('');
    await load();
  };

  const addFood = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageBase64 = imageFile ? await fileToBase64(imageFile) : undefined;
      await api.post('/api/restaurant/foods', {
        categoryId: form.categoryId,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
        isVeg: form.isVeg,
        imageBase64,
      });
      setForm({ categoryId: '', name: '', description: '', price: '', offerPrice: '', isVeg: true });
      setImageFile(null);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailable = async (food: Food) => {
    await api.patch(`/api/restaurant/foods/${food._id}`, { isAvailable: !food.isAvailable });
    await load();
  };

  const deleteFood = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/api/restaurant/foods/${id}`);
    await load();
  };

  const categoryName = (cat: Food['category']) =>
    typeof cat === 'string' ? categories.find((c) => c._id === cat)?.name : cat?.name;

  return (
    <div className="space-y-6">
      <form onSubmit={addCategory} className="card flex items-end gap-3">
        <div className="flex-1">
          <label className="label">New category</label>
          <input
            className="input"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Starters"
            required
          />
        </div>
        <button className="btn-primary">Add category</button>
      </form>

      <form onSubmit={addFood} className="card space-y-3">
        <h2 className="font-semibold text-white">Add food item</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
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
            <label className="label">Price (₹)</label>
            <input
              type="number"
              className="input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Offer price (₹, optional)</label>
            <input
              type="number"
              className="input"
              value={form.offerPrice}
              onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Photo</label>
            <input
              type="file"
              accept="image/*"
              className="text-sm text-slate-300"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.isVeg}
              onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
            />
            <label className="text-sm text-slate-300">Vegetarian</label>
          </div>
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Add item'}
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {foods.map((f) => (
          <div key={f._id} className="card">
            {f.imageUrl && (
              <img src={f.imageUrl} alt={f.name} className="rounded-lg mb-2 h-32 w-full object-cover" />
            )}
            <p className="text-xs text-slate-500">{categoryName(f.category)}</p>
            <p className="font-medium text-white">{f.name}</p>
            <p className="text-sm text-slate-400">
              ₹{f.offerPrice ?? f.price}{' '}
              {f.offerPrice && <span className="line-through text-slate-600">₹{f.price}</span>}
            </p>
            <div className="flex items-center justify-between mt-3">
              <button
                className={`badge ${f.isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}
                onClick={() => toggleAvailable(f)}
              >
                {f.isAvailable ? 'Available' : "86'd"}
              </button>
              <button className="btn-ghost text-sm" onClick={() => deleteFood(f._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {foods.length === 0 && <p className="text-sm text-slate-500">No menu items yet — add one above.</p>}
      </div>
    </div>
  );
}
