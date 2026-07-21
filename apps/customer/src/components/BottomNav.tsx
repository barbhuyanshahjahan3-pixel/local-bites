import { Screen } from '../navigation';

const ITEMS: { screen: Screen['name']; label: string; icon: string }[] = [
  { screen: 'home', label: 'Home', icon: '🏠' },
  { screen: 'search', label: 'Search', icon: '🔍' },
  { screen: 'cart', label: 'Cart', icon: '🛒' },
  { screen: 'orders', label: 'Orders', icon: '📦' },
  { screen: 'profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav({
  active,
  onNavigate,
  cartCount,
}: {
  active: Screen['name'];
  onNavigate: (s: Screen) => void;
  cartCount: number;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 flex z-40">
      {ITEMS.map((item) => (
        <button
          key={item.screen}
          className={`nav-tab relative ${active === item.screen ? 'text-brand' : 'text-slate-400'}`}
          onClick={() => onNavigate({ name: item.screen } as Screen)}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
          {item.screen === 'cart' && cartCount > 0 && (
            <span className="absolute top-0 right-6 bg-brand text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
