import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../api/client';
import { useCartStore } from '../store/cartStore';
import type { Product, ProductSearchResponse } from '../types/product';
import { XIcon } from '../components/icons';
import { ProductCard } from '../components/ProductCard';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_LIMIT = 20;

// Drinks always render last, everything else (Pizza, Pastry, ...) comes
// first, alphabetically, so this works for any tenant's category set
// without hardcoding tenant-specific category names.
function groupByCategory(products: Product[]): Array<[string, Product[]]> {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const list = groups.get(product.category) ?? [];
    list.push(product);
    groups.set(product.category, list);
  }

  return Array.from(groups.entries()).sort(([a], [b]) => {
    if (a === 'Drink' && b !== 'Drink') return 1;
    if (b === 'Drink' && a !== 'Drink') return -1;
    return a.localeCompare(b);
  });
}

export function Catalog() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cartItems = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
    if (search) params.set('search', search);

    apiFetch<ProductSearchResponse>(`/api/products?${params.toString()}`)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.code : 'unknown_error');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, page]);

  function cartQuantityFor(productId: string): number {
    return cartItems.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  function handleChangeQuantity(product: Product, rawValue: number) {
    if (Number.isNaN(rawValue)) return;
    const clamped = Math.max(0, Math.min(rawValue, product.stock));
    setQuantity(
      {
        productId: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl
      },
      clamped
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Catalog</h1>

        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search a product..."
            className="bg-gray-100 rounded-full pl-4 pr-8 py-2 text-sm w-64 focus:outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">Failed to load products.</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">No products found.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {groupByCategory(products).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {category === 'Drink' ? 'Drinks' : category}
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {items.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    quantityInCart={cartQuantityFor(product._id)}
                    onChangeQuantity={(quantity) => handleChangeQuantity(product, quantity)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
