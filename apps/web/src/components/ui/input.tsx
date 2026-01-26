import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Input component variants based on Figma Design System
 *
 * Sizes: default (36px), lg (40px), sm (32px), mini (24px)
 * States: Empty, Placeholder, Value, Focus, Error, Error Focus, Disabled
 */
const inputVariants = cva(
  // Base styles
  [
    'flex w-full bg-white border border-neutral-200 text-foreground',
    'shadow-sm transition-colors duration-150 ease-in-out',
    'placeholder:text-muted-foreground',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
    // Focus state moved to component for error state handling
    'focus-visible:outline-none focus-visible:ring-[3px]',
    // Disabled state
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      inputSize: {
        default: 'min-h-9 px-3 py-[7.5px] text-sm rounded-lg',
        lg: 'min-h-10 px-4 py-[9.5px] text-base rounded-lg',
        sm: 'min-h-8 px-2 py-[5.5px] text-sm rounded-lg',
        mini: 'min-h-6 px-1.5 py-1 text-xs rounded',
      },
    },
    defaultVariants: {
      inputSize: 'default',
    },
  }
);

/**
 * Icon wrapper classes - targets SVG directly for proper sizing
 */
const iconWrapperClasses = {
  default: '[&>svg]:size-5',
  lg: '[&>svg]:size-5',
  sm: '[&>svg]:size-4',
  mini: '[&>svg]:size-3.5',
} as const;

/**
 * Roundness classes based on input size
 */
const roundnessClasses = {
  default: 'rounded-lg',
  lg: 'rounded-lg',
  sm: 'rounded-lg',
  mini: 'rounded',
} as const;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Error state - shows red border and focus ring */
  isError?: boolean;
  /** Icon to display on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side of the input */
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      inputSize,
      isError = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const hasIcons = leftIcon || rightIcon;
    const currentSize = inputSize ?? 'default';
    const iconClasses = iconWrapperClasses[currentSize];
    const roundness = roundnessClasses[currentSize];

    // Focus state classes - mutually exclusive normal/error
    const focusClasses = isError
      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-300'
      : 'focus-visible:border-neutral-400 focus-visible:ring-neutral-300';

    // If we have icons, render a wrapper
    if (hasIcons) {
      return (
        <div
          className={cn(
            'relative flex items-center w-full',
            'bg-white border border-neutral-200 shadow-sm',
            roundness,
            // Size-specific min-height
            currentSize === 'lg' ? 'min-h-10' : currentSize === 'sm' ? 'min-h-8' : currentSize === 'mini' ? 'min-h-6' : 'min-h-9',
            // Focus-within states - mutually exclusive normal/error
            'has-focus-visible:outline-none has-focus-visible:ring-[3px]',
            isError
              ? 'border-red-500 has-focus-visible:border-red-500 has-focus-visible:ring-red-300'
              : 'has-focus-visible:border-neutral-400 has-focus-visible:ring-neutral-300',
            // Disabled state
            'has-disabled:cursor-not-allowed has-disabled:opacity-50',
            className
          )}
        >
          {leftIcon && (
            <span
              className={cn(
                'flex shrink-0 items-center justify-center text-muted-foreground',
                currentSize === 'mini' ? 'pl-1.5' : currentSize === 'sm' ? 'pl-2' : 'pl-3',
                iconClasses
              )}
            >
              {leftIcon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              'flex-1 min-w-0 bg-transparent border-0',
              'text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-0',
              'disabled:cursor-not-allowed',
              // Size-specific text and padding
              currentSize === 'lg' ? 'text-base py-[9.5px]' : currentSize === 'mini' ? 'text-xs py-1' : currentSize === 'sm' ? 'text-sm py-[5.5px]' : 'text-sm py-[7.5px]',
              leftIcon ? 'pl-2' : currentSize === 'mini' ? 'pl-1.5' : currentSize === 'sm' ? 'pl-2' : 'pl-3',
              rightIcon ? 'pr-2' : currentSize === 'mini' ? 'pr-1.5' : currentSize === 'sm' ? 'pr-2' : 'pr-3',
            )}
            ref={ref}
            aria-invalid={isError || undefined}
            {...props}
          />
          {rightIcon && (
            <span
              className={cn(
                'flex shrink-0 items-center justify-center text-muted-foreground',
                currentSize === 'mini' ? 'pr-1.5' : currentSize === 'sm' ? 'pr-2' : 'pr-3',
                iconClasses
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>
      );
    }

    // Simple input without icons
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ inputSize }),
          focusClasses,
          className
        )}
        ref={ref}
        aria-invalid={isError || undefined}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
