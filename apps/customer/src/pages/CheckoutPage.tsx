import { useState, FormEvent } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Screen } from '../navigation';

export default function CheckoutPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { restaurantId, lines, itemsTotal, clear } = useCart();
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!restaurantId || lines.length === 0) {
    return <p className="px-4 py-6 text-sm text-slate-500">Your cart is empty.</p>;
  }

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{
        order: { _id: string };
        razorpayOrder: { id: string; amount: number } | null;
        razorpayKeyId: string;
      }>('/api/customer/orders', {
        restaurantId,
        items: lines.map((l) => ({ foodId: l.food._id, quantity: l.quantity })),
        paymentMethod,
        name,
        mobile,
        deliveryAddress: address,
      });

      if (paymentMethod === 'online' && res.razorpayOrder) {
        const rzp = new window.Razorpay({
          key: res.razorpayKeyId,
          amount: res.razorpayOrder.amount,
          currency: 'INR',
          name: 'Local Bites',
          order_id: res.razorpayOrder.id,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            await api.post('/api/payments/verify', {
              orderId: res.order._id,
              ...response,
            });
            clear();
            onNavigate({ name: 'orderConfirmed', orderId: res.order._id });
          },
          prefill: { name, contact: mobile },
          theme: { color: '#dc2626' },
        });
        rzp.open();
        setLoading(false);
      } else {
        clear();
        onNavigate({ name: 'orderConfirmed', orderId: res.order._id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order');
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <h1 className="text-xl font-semibold text-white">Checkout</h1>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <form onSubmit={placeOrder} className="space-y-4">
        <div className="card space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Mobile number</label>
            <input
              className="input"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Delivery address</label>
            <textarea className="input" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
        </div>

        <div className="card space-y-2">
          <p className="label">Payment method</p>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
            />
            Cash on Delivery
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
            />
            Pay online (UPI / card / netbanking)
          </label>
        </div>

        <div className="card flex items-center justify-between">
          <span className="text-slate-400">Items total</span>
          <span className="text-white font-semibold">₹{itemsTotal}</span>
        </div>

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </div>
  );
}
