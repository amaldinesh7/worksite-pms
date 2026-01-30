/**
 * FlippableAmount Component
 *
 * Displays a currency amount that can be clicked to toggle between
 * short format (₹1.98L) and full format (₹1,98,000) with a flip animation.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Helper Functions
// ============================================

function formatShortCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatFullCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ============================================
// Component
// ============================================

interface FlippableAmountProps {
  amount: number;
  className?: string;
  showPrefix?: boolean;
  prefix?: string;
}

export function FlippableAmount({
  amount,
  className,
  showPrefix = false,
  prefix = '',
}: FlippableAmountProps) {
  const [isShowingFull, setIsShowingFull] = useState(false);

  const shortAmount = formatShortCurrency(Math.abs(amount));
  const fullAmount = formatFullCurrency(Math.abs(amount));

  // Only show flip if the amounts are different
  const isFlippable = shortAmount !== fullAmount;

  const displayAmount = isShowingFull ? fullAmount : shortAmount;
  const displayPrefix = showPrefix ? prefix : '';

  const handleClick = () => {
    if (isFlippable) {
      setIsShowingFull(!isShowingFull);
    }
  };

  return (
    <span
      onClick={handleClick}
      className={cn(
        'inline-block transition-all duration-300',
        isFlippable && 'cursor-pointer hover:opacity-80',
        className
      )}
      title={
        isFlippable
          ? isShowingFull
            ? 'Click for short format'
            : 'Click for full amount'
          : undefined
      }
    >
      <span
        key={isShowingFull ? 'full' : 'short'}
        className={cn('inline-block', isFlippable && 'animate-flip-amount')}
      >
        {displayPrefix}
        {displayAmount}
      </span>
    </span>
  );
}

// Export helper functions for use elsewhere
export { formatShortCurrency, formatFullCurrency };
