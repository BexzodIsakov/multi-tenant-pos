import { useParams } from 'react-router-dom';

export function Receipt() {
  const { orderId } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Receipt</h1>
      <p className="text-sm text-gray-500 mt-2">Receipt for order {orderId} goes here.</p>
    </div>
  );
}
