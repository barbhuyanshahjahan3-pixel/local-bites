const { getIO } = require('./index');

const safeEmit = (room, event, payload) => {
  try {
    getIO().to(room).emit(event, payload);
  } catch {
    // Socket layer not initialized (e.g. running controller in a script/test) — no-op.
  }
};

module.exports = {
  emitToCustomer: (customerId, event, payload) => safeEmit(`customer:${customerId}`, event, payload),
  emitToRestaurant: (restaurantId, event, payload) => safeEmit(`restaurant:${restaurantId}`, event, payload),
  emitToPartner: (partnerId, event, payload) => safeEmit(`partner:${partnerId}`, event, payload),
  emitToDeliveryPool: (cityId, event, payload) => safeEmit(`delivery-pool:${cityId}`, event, payload),
  emitToAdmins: (event, payload) => safeEmit('admin-room', event, payload),
};
