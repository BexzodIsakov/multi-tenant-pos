interface QuantityStepperProps {
  quantity: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetQuantity: (quantity: number) => void;
  itemName: string;
}

export function QuantityStepper({
  quantity,
  max,
  onIncrement,
  onDecrement,
  onSetQuantity,
  itemName
}: QuantityStepperProps) {
  const atLimit = quantity >= max;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Remove one ${itemName}`}
        className="bg-gray-100 text-gray-700 rounded-lg w-9 h-9 flex items-center justify-center text-base font-semibold hover:bg-gray-200"
      >
        -
      </button>
      <input
        type="number"
        min={1}
        max={max}
        value={quantity}
        onChange={(e) => onSetQuantity(Number(e.target.value))}
        aria-label={`Quantity for ${itemName}`}
        className="w-12 text-center text-sm font-semibold text-gray-900 border border-gray-200 rounded-md py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <button
        type="button"
        disabled={atLimit}
        onClick={onIncrement}
        aria-label={`Add one more ${itemName}`}
        className="bg-amber-400 text-gray-900 rounded-lg w-9 h-9 flex items-center justify-center text-base font-semibold hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}
