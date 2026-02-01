/**
 * Checksum Banner
 *
 * Displays validation status for document totals vs calculated totals.
 */

import { CheckCircle, Warning } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface ChecksumBannerProps {
  checksumMatch: boolean;
  documentTotal?: number;
  calculatedTotal: number;
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// ============================================
// Component
// ============================================

export function ChecksumBanner({
  checksumMatch,
  documentTotal,
  calculatedTotal,
  className,
}: ChecksumBannerProps) {
  // If no document total, we can't compare
  if (documentTotal === undefined) {
    return null;
  }

  const difference = Math.abs(documentTotal - calculatedTotal);

  if (checksumMatch) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200',
          className
        )}
      >
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Totals Match</p>
          <p className="text-xs text-green-700">
            Document total: {formatCurrency(documentTotal)} | Calculated:{' '}
            {formatCurrency(calculatedTotal)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200',
        className
      )}
    >
      <Warning className="h-5 w-5 text-amber-600 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">
          Total Mismatch (Difference: {formatCurrency(difference)})
        </p>
        <p className="text-xs text-amber-700">
          Document shows: {formatCurrency(documentTotal)} | Calculated:{' '}
          {formatCurrency(calculatedTotal)}
        </p>
        <p className="text-xs text-amber-600 mt-1">
          Please review flagged items to resolve the difference
        </p>
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
interface ChecksumIndicatorProps {
  checksumMatch: boolean;
  className?: string;
}

export function ChecksumIndicator({ checksumMatch, className }: ChecksumIndicatorProps) {
  if (checksumMatch) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full',
          className
        )}
      >
        <CheckCircle className="h-3 w-3" />
        Verified
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full',
        className
      )}
    >
      <Warning className="h-3 w-3" />
      Mismatch
    </span>
  );
}
