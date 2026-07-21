import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../api/client';

export function useDeliverySocket(
  cityId: string | null,
  handlers: {
    onDeliveryAvailable?: (payload: unknown) => void;
    onOrderAssigned?: (payload: unknown) => void;
    onOrderStatus?: (payload: unknown) => void;
  }
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('lb_delivery_token');
    if (!token) return;

    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    if (handlers.onDeliveryAvailable) socket.on('delivery_available', handlers.onDeliveryAvailable);
    if (handlers.onOrderAssigned) socket.on('order_assigned', handlers.onOrderAssigned);
    if (handlers.onOrderStatus) socket.on('order_status', handlers.onOrderStatus);

    if (cityId) socket.emit('go_online', { cityId });

    return () => {
      if (cityId) socket.emit('go_offline', { cityId });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);
}
