export type Screen =
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'restaurant'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'orderConfirmed'; orderId: string }
  | { name: 'orders' }
  | { name: 'orderDetail'; id: string }
  | { name: 'wishlist' }
  | { name: 'profile' }
  | { name: 'complaints' };
