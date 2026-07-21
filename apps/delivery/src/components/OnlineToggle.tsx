import { useState } from 'react';
import { api } from '../api/client';

export default function OnlineToggle({
  isOnline,
  onChange,
}: {
  isOnline: boolean;
  onChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const next = !isOnline;
      if (next && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          await api.patch('/api/delivery/status', {
            isOnline: next,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          onChange(next);
          setLoading(false);
        }, async () => {
          await api.patch('/api/delivery/status', { isOnline: next });
          onChange(next);
          setLoading(false);
        });
      } else {
        await api.patch('/api/delivery/status', { isOnline: next });
        onChange(next);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn text-sm ${isOnline ? 'bg-brand text-white' : 'bg-slate-800 text-slate-300'}`}
    >
      {isOnline ? '🟢 Online' : '⚪ Offline'}
    </button>
  );
}
