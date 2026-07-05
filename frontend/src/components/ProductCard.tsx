import { API_BASE_URL } from '../api/config';
import type { Product } from '../types/product';
import { QuantityStepper } from './QuantityStepper';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetQuantity: (quantity: number) => void;
}

export function ProductCard({
  product,
  quantityInCart,
  onIncrement,
  onDecrement,
  onSetQuantity
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <img
        src={`${API_BASE_URL}${product.imageUrl}`}
        alt={product.name}
        className="w-full aspect-square object-cover rounded-lg mb-3"
      />
      <div className="text-base font-semibold text-gray-900">{product.name}</div>
      <div className="text-sm text-gray-500 mb-3">
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
        {quantityInCart === 0 ? (
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={onIncrement}
            className="bg-amber-400 text-gray-900 font-semibold rounded-lg px-3 py-1.5 text-sm hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        ) : (
          <QuantityStepper
            quantity={quantityInCart}
            max={product.stock}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onSetQuantity={onSetQuantity}
            itemName={product.name}
          />
        )}
      </div>
    </div>
  );
}
