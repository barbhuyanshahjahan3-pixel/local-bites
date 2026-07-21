export interface DeliveryOrderSummary {
  orderId: string;
  orderNumber: string;
}

export interface AssignedOrder {
  _id: string;
  orderNumber: string;
  items: { name: string; price: number; quantity: number }[];
  grandTotal: number;
  paymentMethod: 'cod' | 'online';
  paymentStatus: string;
  customerName: string;
  customerMobile: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  status: string;
  deliveryPartner: string | null;
}

export interface HistoryOrder {
  _id: string;
  orderNumber: string;
  deliveryCharge: number;
  deliveredAt: string;
}

export interface Earnings {
  totalEarnings: number;
  totalDeliveries: number;
}
