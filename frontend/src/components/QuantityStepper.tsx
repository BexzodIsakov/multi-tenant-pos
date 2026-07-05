import { MinusIcon, PlusIcon } from './icons';

interface QuantityStepperProps {
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
  itemName: string;
}

export function QuantityStepper({
  quantity,
  max,
  onChange,
  itemName,
}: QuantityStepperProps) {
  const atLimit = quantity >= max;
  const atFloor = quantity <= 0;

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        disabled={atFloor}
        onClick={() => onChange(quantity - 1)}
        aria-label={`Remove one ${itemName}`}
        className='leading-none bg-gray-100 text-gray-700 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      <input
        type='text'
        inputMode='numeric'
        value={quantity}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Quantity for ${itemName}`}
        className='w-12 text-center text-sm font-semibold text-gray-900 border border-gray-200 rounded-md py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400'
      />
      <button
        type='button'
        disabled={atLimit}
        onClick={() => onChange(quantity + 1)}
        aria-label={`Add one more ${itemName}`}
        className='bg-amber-400 text-gray-900 rounded-full w-9 h-9 flex items-center justify-center hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
