import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../api/client';
import type { SalesReport } from '../types/report';

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultFromDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return formatDateInput(date);
}

export function AdminReport() {
  const [from, setFrom] = useState(defaultFromDate());
  const [to, setTo] = useState(formatDateInput(new Date()));
  const [report, setReport] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      from: new Date(from).toISOString(),
      // End of the selected day, not the start of it, so today's date
      // range includes orders paid later that same day.
      to: new Date(`${to}T23:59:59.999`).toISOString()
    });

    apiFetch<SalesReport>(`/api/reports/sales?${params.toString()}`)
      .then((data) => {
        if (cancelled) return;
        setReport(data);
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
  }, [from, to]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Report</h1>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">Failed to load report.</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
              <div className="text-2xl font-semibold text-gray-900">
                ${report.totalRevenue.toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-1">Total Margin</div>
              <div className="text-2xl font-semibold text-gray-900">
                ${report.totalMargin.toFixed(2)}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Products</h2>
          {report.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No paid orders in this date range.</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {report.topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {index + 1}. {product.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.totalQuantity} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
