import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../api/client';

// Connects once per session, joins the restaurant's own room server-side
// (based on the JWT), and lets callers subscribe to events.
export function useRestaurantSocket(onNewOrder: (payload: unknown) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('lb_restaurant_token');
    if (!token) return;

    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;
    socket.on('new_order', onNewOrder);

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
