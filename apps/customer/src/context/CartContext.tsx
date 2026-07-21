import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartLine, Food } from '../api/types';

interface CartState {
  restaurantId: string | null;
  lines: CartLine[];
  addItem: (food: Food, restaurantId: string) => void;
  removeItem: (foodId: string) => void;
  setQuantity: (foodId: string, quantity: number) => void;
  clear: () => void;
  itemsTotal: number;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [restaurantId, setRestaurantId] = useState<string | null>(
    localStorage.getItem('lb_cart_restaurant')
  );
  const [lines, setLines] = useState<CartLine[]>(
    JSON.parse(localStorage.getItem('lb_cart_lines') || '[]')
  );

  useEffect(() => {
    if (restaurantId) localStorage.setItem('lb_cart_restaurant', restaurantId);
    else localStorage.removeItem('lb_cart_restaurant');
    localStorage.setItem('lb_cart_lines', JSON.stringify(lines));
  }, [restaurantId, lines]);

  const addItem = (food: Food, resId: string) => {
    // Local Bites carts are single-restaurant: switching restaurants clears the cart,
    // matching how most delivery platforms handle it (one active delivery per order).
    if (restaurantId && restaurantId !== resId) {
      if (!confirm('Starting an order from a new restaurant will clear your current cart. Continue?')) {
        return;
      }
      setLines([{ food, quantity: 1 }]);
      setRestaurantId(resId);
      return;
    }
    setRestaurantId(resId);
    setLines((prev) => {
      const existing = prev.find((l) => l.food._id === food._id);
      if (existing) {
        return prev.map((l) => (l.food._id === food._id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { food, quantity: 1 }];
    });
  };

  const removeItem = (foodId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.food._id !== foodId);
      if (next.length === 0) setRestaurantId(null);
      return next;
    });
  };

  const setQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(foodId);
    setLines((prev) => prev.map((l) => (l.food._id === foodId ? { ...l, quantity } : l)));
  };

  const clear = () => {
    setLines([]);
    setRestaurantId(null);
  };

  const itemsTotal = lines.reduce((sum, l) => sum + (l.food.offerPrice ?? l.food.price) * l.quantity, 0);

  return (
    <CartContext.Provider value={{ restaurantId, lines, addItem, removeItem, setQuantity, clear, itemsTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
