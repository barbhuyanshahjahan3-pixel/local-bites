import { useCart } from '../context/CartContext';
import { Screen } from '../navigation';

export default function CartPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { lines, setQuantity, removeItem, itemsTotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="px-4 py-6 pb-24">
        <p className="text-sm text-slate-500">Your cart is empty.</p>
        <button className="btn-primary mt-4" onClick={() => onNavigate({ name: 'home' })}>
          Browse restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3 pb-24">
      <h1 className="text-xl font-semibold text-white">Your cart</h1>
      {lines.map((l) => (
        <div key={l.food._id} className="card flex items-center gap-3">
          {l.food.imageUrl && (
            <img src={l.food.imageUrl} alt={l.food.name} className="w-16 h-16 rounded-lg object-cover" />
          )}
          <div className="flex-1">
            <p className="font-medium text-white">{l.food.name}</p>
            <p className="text-sm text-slate-400">₹{l.food.offerPrice ?? l.food.price}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost w-8 h-8 p-0" onClick={() => setQuantity(l.food._id, l.quantity - 1)}>
              −
            </button>
            <span className="w-6 text-center">{l.quantity}</span>
            <button className="btn-ghost w-8 h-8 p-0" onClick={() => setQuantity(l.food._id, l.quantity + 1)}>
              +
            </button>
          </div>
        </div>
      ))}

      <div className="card flex items-center justify-between">
        <span className="text-slate-400">Items total</span>
        <span className="text-white font-semibold">₹{itemsTotal}</span>
      </div>

      <button className="btn-primary w-full" onClick={() => onNavigate({ name: 'checkout' })}>
        Proceed to checkout
      </button>
    </div>
  );
}
