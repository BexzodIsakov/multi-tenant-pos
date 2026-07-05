import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  stock: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  setQuantity: (product: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  // A quantity of 0 or less removes the item entirely, this is the one
  // place that decides "in cart" vs "not in cart", callers just pass the
  // new quantity they want, whether that came from +/-, typing, or an
  // initial add from 0.
  setQuantity: (product, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.productId !== product.productId) };
      }

      const existing = state.items.find((item) => item.productId === product.productId);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.productId ? { ...item, quantity } : item
          )
        };
      }

      return { items: [...state.items, { ...product, quantity }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId)
    })),

  clearCart: () => set({ items: [] })
}));
