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
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  decrementItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.productId === product.productId);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.productId
              ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
              : item
          )
        };
      }

      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId)
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    })),

  decrementItem: (productId) =>
    set((state) => {
      const existing = state.items.find((item) => item.productId === productId);
      if (!existing) return state;

      if (existing.quantity <= 1) {
        return { items: state.items.filter((item) => item.productId !== productId) };
      }

      return {
        items: state.items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
      };
    }),

  clearCart: () => set({ items: [] })
}));
