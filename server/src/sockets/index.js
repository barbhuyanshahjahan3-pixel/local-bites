const { verifyToken } = require('../utils/authUtils');

let ioInstance = null;

// Rooms convention:
//  customer:<customerId>
//  restaurant:<restaurantId>
//  partner:<partnerId>
//  delivery-pool:<cityId>   (all online delivery partners in a city)
//  admin-room                (all admin/super_admin dashboards)
const initSockets = (io) => {
  ioInstance = io;

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      socket.user = verifyToken(token);
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    if (role === 'customer') socket.join(`customer:${id}`);
    if (role === 'restaurant') socket.join(`restaurant:${id}`);
    if (role === 'delivery_partner') socket.join(`partner:${id}`);
    if (role === 'admin' || role === 'super_admin') socket.join('admin-room');

    // Delivery partner joins their city's pool when they go online.
    socket.on('go_online', ({ cityId }) => {
      if (role === 'delivery_partner' && cityId) socket.join(`delivery-pool:${cityId}`);
    });
    socket.on('go_offline', ({ cityId }) => {
      if (role === 'delivery_partner' && cityId) socket.leave(`delivery-pool:${cityId}`);
    });

    socket.on('disconnect', () => {});
  });
};

const getIO = () => {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
};

module.exports = { initSockets, getIO };
