import { Screen } from '../navigation';

export default function OrderConfirmedPage({
  orderId,
  onNavigate,
}: {
  orderId: string;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <div className="px-4 py-16 text-center space-y-4">
      <div className="text-5xl">✅</div>
      <h1 className="text-xl font-semibold text-white">
        Your order has been placed successfully. Thank you so much.
      </h1>
      <button className="btn-primary" onClick={() => onNavigate({ name: 'orderDetail', id: orderId })}>
        Track your order
      </button>
      <div>
        <button className="text-sm text-slate-400" onClick={() => onNavigate({ name: 'home' })}>
          Back to home
        </button>
      </div>
    </div>
  );
}
