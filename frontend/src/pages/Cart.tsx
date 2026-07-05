import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, ApiError } from '../api/client';
import { API_BASE_URL } from '../api/config';
import { useCartStore, CartItem } from '../store/cartStore';
import { XIcon } from '../components/icons';
import { QuantityStepper } from '../components/QuantityStepper';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { CreateOrderResponse, InsufficientStockDetail } from '../types/order';

export function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<Record<string, number>>({});
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const pendingRemoveItem = items.find((item) => item.productId === pendingRemoveId) ?? null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleQuantityChange(item: CartItem, value: number) {
    if (Number.isNaN(value)) return;
    // Floor of 1 here, on purpose: editing quantity in the cart never
    // removes the line item, that only happens through the explicit
    // remove button + confirmation dialog below.
    const clamped = Math.max(1, Math.min(value, item.stock));
    const { quantity: _quantity, ...productInfo } = item;
    setQuantity(productInfo, clamped);

    setStockErrors((prev) => {
      if (!(item.productId in prev)) return prev;
      const rest = { ...prev };
      delete rest[item.productId];
      return rest;
    });
  }

  async function handleCheckout() {
    setGeneralError(null);
    setStockErrors({});
    setIsCheckingOut(true);

    try {
      const response = await apiFetch<CreateOrderResponse>('/api/orders', {
        method: 'POST',
        body: { items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })) }
      });
      clearCart();
      navigate(`/receipt/${response.orderId}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'insufficient_stock') {
        const details = (err.details as InsufficientStockDetail[]) ?? [];
        setStockErrors(
          details.reduce<Record<string, number>>((acc, detail) => {
            acc[detail.productId] = detail.available;
            return acc;
          }, {})
        );
      } else {
        setGeneralError('Checkout failed. Please try again.');
      }
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Cart</h1>
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Cart</h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const stockError = stockErrors[item.productId];

          return (
            <div
              key={item.productId}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
            >
              <img
                src={`${API_BASE_URL}${item.imageUrl}`}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />

              <div className="flex-1">
                <div className="font-semibold text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                {stockError !== undefined && (
                  <div className="text-sm text-red-600 mt-1">
                    {stockError === 0 ? 'Out of stock' : `Only ${stockError} available`}
                  </div>
                )}
              </div>

              <QuantityStepper
                quantity={item.quantity}
                max={item.stock}
                onChange={(quantity) => handleQuantityChange(item, quantity)}
                itemName={item.name}
              />

              <div className="w-20 text-right font-semibold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                type="button"
                onClick={() => setPendingRemoveId(item.productId)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={`Remove ${item.name}`}
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mt-6 flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
      </div>

      {generalError && <p className="text-sm text-red-600 mt-4">{generalError}</p>}

      <button
        type="button"
        disabled={isCheckingOut}
        onClick={handleCheckout}
        className="w-full bg-amber-400 text-gray-900 font-semibold rounded-lg px-4 py-3 mt-4 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCheckingOut ? 'Placing order...' : 'Order'}
      </button>

      {pendingRemoveItem && (
        <ConfirmDialog
          title="Remove item"
          message={`Remove ${pendingRemoveItem.name} from the cart?`}
          confirmLabel="Remove"
          onConfirm={() => {
            removeItem(pendingRemoveItem.productId);
            setPendingRemoveId(null);
          }}
          onCancel={() => setPendingRemoveId(null)}
        />
      )}
    </div>
  );
}
