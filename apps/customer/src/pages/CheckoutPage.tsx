import { useState, FormEvent } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Screen } from '../navigation';

type PlaceOrderResponse = {
  order: { _id: string; grandTotal: number; advanceAmount: number; codRemainingAmount: number };
  razorpayOrder: { id: string; amount: number };
  razorpayKeyId: string;
};

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

  // Rough client-side estimate just for display before checkout — the server computes
  // the authoritative amounts (including delivery charge) and that's what's actually charged.
  const estimatedAdvance = paymentMethod === 'online' ? itemsTotal : Math.round(itemsTotal / 2);
  const estimatedCodRemaining = paymentMethod === 'online' ? 0 : itemsTotal - estimatedAdvance;

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<PlaceOrderResponse>('/api/customer/orders', {
        restaurantId,
        items: lines.map((l) => ({ foodId: l.food._id, quantity: l.quantity })),
        paymentMethod,
        name,
        mobile,
        deliveryAddress: address,
      });

      // Every order requires an online payment now — the full amount for 'online',
      // or the 50% advance for 'cod'. The restaurant is never notified until this
      // payment is verified, so an order isn't really "placed" until it's paid.
      const rzp = new window.Razorpay({
        key: res.razorpayKeyId,
        amount: res.razorpayOrder.amount,
        currency: 'INR',
        name: 'Local Bites',
        description:
          res.order.codRemainingAmount > 0
            ? `Advance payment (Rs.${res.order.codRemainingAmount} due as cash on delivery)`
            : 'Full payment',
        order_id: res.razorpayOrder.id,
        // UPI (which covers GPay, PhonePe, Paytm, BHIM, etc.) is already offered
        // automatically by Razorpay's checkout alongside cards/netbanking — no
        // separate integration is needed per payment app.
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
        modal: {
          ondismiss: () => setLoading(false),
        },
        prefill: { name, contact: mobile },
        theme: { color: '#dc2626' },
      });
      rzp.open();
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
            Cash on Delivery — pay 50% now online, rest in cash at delivery
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
            />
            Pay full amount online now (UPI / card / netbanking)
          </label>
        </div>

        <div className="card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Items total</span>
            <span className="text-white">Rs.{itemsTotal}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span className="text-slate-300">Pay now (online)</span>
            <span className="text-white">Rs.{estimatedAdvance}</span>
          </div>
          {estimatedCodRemaining > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Pay on delivery (cash)</span>
              <span className="text-slate-300">Rs.{estimatedCodRemaining}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 pt-1">
            Delivery charge is added at checkout. If you cancel this order after paying, the
            online amount already paid is not refunded.
          </p>
        </div>

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Opening payment…' : `Pay Rs.${estimatedAdvance} & place order`}
        </button>
      </form>
    </div>
  );
}
