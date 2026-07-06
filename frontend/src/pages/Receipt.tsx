import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, ApiError } from '../api/client';
import type { Receipt as ReceiptData } from '../types/receipt';

const POLL_INTERVAL_MS = 2000;

export function Receipt() {
  const { orderId } = useParams();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function fetchReceipt() {
      apiFetch<ReceiptData>(`/api/orders/${orderId}/receipt`)
        .then((data) => {
          if (cancelled) return;
          setReceipt(data);

          if (data.status === 'pending_payment') {
            timeoutId = setTimeout(fetchReceipt, POLL_INTERVAL_MS);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof ApiError ? err.code : 'unknown_error');
        });
    }

    fetchReceipt();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [orderId]);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Receipt</h1>
        <p className="text-sm text-red-600">Could not load this receipt.</p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Receipt</h1>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Receipt</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Order #{receipt._id}</span>
          {receipt.status === 'paid' ? (
            <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full px-2.5 py-0.5">
              Paid
            </span>
          ) : (
            <span className="text-xs font-medium bg-amber-100 text-amber-800 rounded-full px-2.5 py-0.5">
              Waiting for payment
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {receipt.items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {item.name} x{item.quantity}
              </span>
              <span className="font-medium text-gray-900">${item.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-base font-semibold text-gray-900">
            ${receipt.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
