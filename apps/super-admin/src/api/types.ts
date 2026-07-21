export interface City {
  _id: string;
  name: string;
  state: string;
  isActive: boolean;
}

export interface Restaurant {
  _id: string;
  restaurantId: string;
  name: string;
  city: string;
  address: string;
  contactPhone: string;
  isOpen: boolean;
  accessCode: string;
}

export interface DeliveryPartner {
  _id: string;
  partnerId: string;
  name: string;
  mobile: string;
  city: string;
  vehicleType: string;
  isOnline: boolean;
  accessCode: string;
}

export interface Admin {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  isDisabled: boolean;
  accessCode: string;
}

export interface Credentials {
  accessCode: string;
  tempPassword: string;
}
