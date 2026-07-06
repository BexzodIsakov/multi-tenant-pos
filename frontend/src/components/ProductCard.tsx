import { API_BASE_URL } from '../api/config';
import type { Product } from '../types/product';
import { QuantityStepper } from './QuantityStepper';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onChangeQuantity: (quantity: number) => void;
}

export function ProductCard({ product, quantityInCart, onChangeQuantity }: ProductCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 flex flex-col transition-shadow ${
        quantityInCart > 0 ? 'ring-2 ring-amber-400' : ''
      }`}
    >
      <img
        src={`${API_BASE_URL}${product.imageUrl}`}
        alt={product.name}
        className={`w-full aspect-[4/3] object-cover rounded-lg mb-3 ${product.stock === 0 ? 'grayscale' : ''}`}
      />
      <div className="text-base font-semibold text-gray-900">{product.name}</div>
      <div className={`text-sm mb-3 ${product.stock > 0 ? 'text-gray-500' : 'text-red-600 font-semibold'}`}>
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
        <QuantityStepper
          quantity={quantityInCart}
          max={product.stock}
          onChange={onChangeQuantity}
          itemName={product.name}
        />
      </div>
    </div>
  );
}
