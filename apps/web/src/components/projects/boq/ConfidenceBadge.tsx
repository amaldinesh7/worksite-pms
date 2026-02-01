/**
 * Confidence Badge
 *
 * Visual indicator for AI confidence levels.
 * - Green (>80%): High confidence
 * - Yellow (60-80%): Medium confidence
 * - Red (<60%): Low confidence - needs review
 */

import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: number; // 0-1 scale
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ConfidenceBadge({
  confidence,
  showLabel = true,
  size = 'sm',
  className,
}: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);

  const getLevel = (): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const level = getLevel();

  const colorClasses = {
    high: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-red-100 text-red-700 border-red-200',
  };

  const dotClasses = {
    high: 'bg-green-500',
    medium: 'bg-amber-500',
    low: 'bg-red-500',
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        colorClasses[level],
        sizeClasses[size],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotClasses[level])} />
      {showLabel ? `${percentage}%` : null}
    </span>
  );
}

/**
 * Confidence Dot
 *
 * Minimal confidence indicator (just a colored dot).
 */
interface ConfidenceDotProps {
  confidence: number;
  className?: string;
}

export function ConfidenceDot({ confidence, className }: ConfidenceDotProps) {
  const getLevel = (): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const level = getLevel();

  const dotClasses = {
    high: 'bg-green-500',
    medium: 'bg-amber-500',
    low: 'bg-red-500',
  };

  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full', dotClasses[level], className)}
      title={`${Math.round(confidence * 100)}% confidence`}
    />
  );
}

/**
 * Confidence Bar
 *
 * Horizontal bar visualization of confidence.
 */
interface ConfidenceBarProps {
  confidence: number;
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBar({ confidence, showLabel = true, className }: ConfidenceBarProps) {
  const percentage = Math.round(confidence * 100);

  const getColor = (): string => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-muted-foreground w-8">{percentage}%</span>}
    </div>
  );
}
