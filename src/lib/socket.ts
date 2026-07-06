import { io, type Socket } from 'socket.io-client';
import { store } from '../app/store';
import { logout } from '../redux/features/auth/authSlice';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) return;

  const socketUrl =
    (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:5000';

  socket = io(socketUrl, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'], // Disable HTTP polling to prevent flooding Vercel
    reconnectionAttempts: 3, // Prevent infinite reconnection loops
    reconnectionDelay: 10000, // Wait 10 seconds between attempts
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    if (
      error.message.toLowerCase().includes('token') ||
      error.message.toLowerCase().includes('auth') ||
      error.message.toLowerCase().includes('unauthorized')
    ) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};
