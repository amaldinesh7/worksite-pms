import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Button component variants based on Figma Design System
 *
 * Variants: primary, secondary, outline, ghost, destructive
 * Sizes: default (36px), lg (44px), sm (32px), mini (24px)
 * Icon Sizes: icon (36x36), iconLg (40x40), iconSm (32x32), iconMini (24x24)
 */
const buttonVariants = cva(
  // Base styles
  [
    'cursor-pointer inline-flex items-center justify-center gap-2',
    'whitespace-nowrap font-medium rounded-sm',
    'transition-colors duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-btn-focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-btn-primary text-btn-primary-foreground',
          'hover:bg-btn-primary-hover active:bg-btn-primary-hover',
        ],
        secondary: [
          'bg-btn-secondary text-btn-secondary-foreground',
          'hover:bg-btn-secondary-hover active:bg-btn-secondary-hover',
        ],
        outline: [
          'bg-btn-outline-bg text-btn-outline-foreground',
          'border border-btn-outline-border',
          'shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]',
          'hover:bg-btn-outline-hover active:bg-btn-outline-hover',
        ],
        ghost: [
          'bg-btn-ghost-bg text-btn-ghost-foreground',
          'hover:bg-btn-ghost-hover active:bg-btn-ghost-hover',
        ],
        destructive: [
          'bg-btn-destructive text-btn-destructive-foreground',
          'hover:bg-btn-destructive-hover active:bg-btn-destructive-hover',
        ],
        // Legacy variant for backwards compatibility
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-9 px-4 py-2 text-sm [&_svg]:size-4',
        lg: 'min-h-11 px-5 py-3 text-base [&_svg]:size-5',
        sm: 'min-h-8 px-3 py-1.5 text-sm [&_svg]:size-4',
        mini: 'min-h-6 px-2 py-1 text-xs [&_svg]:size-3.5',
        // Icon-only button sizes (square)
        icon: 'size-9 p-2 [&_svg]:size-5', // 36x36 (default)
        iconLg: 'size-10 p-2 [&_svg]:size-6', // 40x40 (large)
        iconSm: 'size-8 p-1.5 [&_svg]:size-4', // 32x32 (small)
        iconMini: 'size-6 p-1 [&_svg]:size-3.5', // 24x24 (mini)
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render as child element (Radix Slot) */
  asChild?: boolean;
  /** Icon to display before the button text */
  leftIcon?: React.ReactNode;
  /** Icon to display after the button text */
  rightIcon?: React.ReactNode;
  /** Loading state - shows spinner and disables button */
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || isLoading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

/**
 * Loading spinner component for button loading state
 */
function LoadingSpinner({
  size,
}: {
  size?: 'default' | 'lg' | 'sm' | 'mini' | 'icon' | 'iconLg' | 'iconSm' | 'iconMini' | null;
}) {
  const spinnerSize = {
    default: 'size-4',
    lg: 'size-5',
    sm: 'size-4',
    mini: 'size-3.5',
    icon: 'size-5',
    iconLg: 'size-6',
    iconSm: 'size-4',
    iconMini: 'size-3.5',
  }[size ?? 'default'];

  return (
    <svg
      className={cn('animate-spin', spinnerSize)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export { Button, buttonVariants };
