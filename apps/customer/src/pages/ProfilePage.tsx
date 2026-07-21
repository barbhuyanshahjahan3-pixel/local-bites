import { useAuth } from '../context/AuthContext';
import { Screen } from '../navigation';

export default function ProfilePage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { profile, logout } = useAuth();

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <h1 className="text-xl font-semibold text-white">Profile</h1>
      <div className="card">
        <p className="font-medium text-white">{profile?.name}</p>
      </div>

      <div className="space-y-2">
        <button className="card w-full text-left" onClick={() => onNavigate({ name: 'wishlist' })}>
          ♡ Wishlist
        </button>
        <button className="card w-full text-left" onClick={() => onNavigate({ name: 'complaints' })}>
          💬 Support & complaints
        </button>
      </div>

      <button className="btn-ghost w-full" onClick={logout}>
        Log out
      </button>
    </div>
  );
}
