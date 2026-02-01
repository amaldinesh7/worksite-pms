import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * InputGroup component based on Figma Design System
 *
 * Provides prefix/suffix add-ons for inputs:
 * - Text prefixes (e.g., "https://", "$")
 * - Text suffixes (e.g., ".com", "USD")
 * - Icon prefixes/suffixes
 * - Button add-ons
 *
 * Sizes: default (36px), lg (40px), sm (32px), mini (24px)
 */

const inputGroupVariants = cva(
  // Base styles
  [
    'flex items-stretch w-full',
    'bg-white border border-gray-200 shadow-sm',
    'transition-colors duration-150 ease-in-out overflow-hidden',
    // Focus-within states - border #a3a3a3, ring #d4d4d4
    'has-[:focus-visible]:border-gray-400 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-gray-300',
    // Disabled state
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
  ],
  {
    variants: {
      inputSize: {
        default: 'min-h-9 text-sm rounded-lg',
        lg: 'min-h-10 text-base rounded-lg',
        sm: 'min-h-8 text-sm rounded-lg',
        mini: 'min-h-6 text-xs rounded',
      },
    },
    defaultVariants: {
      inputSize: 'default',
    },
  }
);

/**
 * Size-specific styles for internal elements
 */
const sizeStyles = {
  default: {
    padding: 'px-3 py-[7.5px]',
    addonPadding: 'px-3',
    iconClasses: '[&>svg]:size-5',
    gap: 'gap-2',
  },
  lg: {
    padding: 'px-4 py-[9.5px]',
    addonPadding: 'px-4',
    iconClasses: '[&>svg]:size-5',
    gap: 'gap-2',
  },
  sm: {
    padding: 'px-2 py-[5.5px]',
    addonPadding: 'px-2',
    iconClasses: '[&>svg]:size-4',
    gap: 'gap-1.5',
  },
  mini: {
    padding: 'px-1.5 py-1',
    addonPadding: 'px-1.5',
    iconClasses: '[&>svg]:size-3.5',
    gap: 'gap-1',
  },
} as const;

export interface InputGroupProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'prefix'>,
    VariantProps<typeof inputGroupVariants> {
  /** Error state - shows red border and focus ring */
  isError?: boolean;
  /** Text or element to display before the input */
  prefix?: React.ReactNode;
  /** Text or element to display after the input */
  suffix?: React.ReactNode;
  /** Icon to display on the left side inside the input area */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side inside the input area */
  rightIcon?: React.ReactNode;
  /** Button or action element to attach at the end */
  addonRight?: React.ReactNode;
  /** Button or action element to attach at the start */
  addonLeft?: React.ReactNode;
  /** The input element(s) */
  children: React.ReactNode;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  (
    {
      className,
      inputSize,
      isError = false,
      prefix,
      suffix,
      leftIcon,
      rightIcon,
      addonLeft,
      addonRight,
      children,
      ...props
    },
    ref
  ) => {
    const currentSize = inputSize ?? 'default';
    const styles = sizeStyles[currentSize];

    // Error state classes - border #ef4444, ring #fca5a5
    const errorClasses = isError
      ? 'border-red-500 has-[:focus-visible]:border-red-500 has-[:focus-visible]:ring-red-300'
      : '';

    return (
      <div
        ref={ref}
        className={cn(inputGroupVariants({ inputSize }), errorClasses, className)}
        {...props}
      >
        {/* Addon Left (e.g., attached button) */}
        {addonLeft && (
          <div className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50">
            {addonLeft}
          </div>
        )}

        {/* Prefix (e.g., "https://", "$") */}
        {prefix && (
          <span
            className={cn(
              'flex shrink-0 items-center text-muted-foreground bg-gray-50 border-r border-gray-200',
              styles.addonPadding
            )}
          >
            {prefix}
          </span>
        )}

        {/* Left Icon */}
        {leftIcon && (
          <span
            className={cn(
              'flex shrink-0 items-center justify-center text-muted-foreground',
              currentSize === 'mini' ? 'pl-1.5' : currentSize === 'sm' ? 'pl-2' : 'pl-3',
              styles.iconClasses
            )}
          >
            {leftIcon}
          </span>
        )}

        {/* Input Area - Clone children to pass through context */}
        <div className="flex flex-1 items-center min-w-0">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Clone the input element and inject necessary classes
              return React.cloneElement(
                child as React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>,
                {
                  className: cn(
                    'flex-1 min-w-0 bg-transparent border-0',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-0',
                    'disabled:cursor-not-allowed',
                    styles.padding,
                    // Adjust padding based on icons
                    leftIcon && '!pl-2',
                    rightIcon && '!pr-2',
                    (child as React.ReactElement<{ className?: string }>).props.className
                  ),
                  'aria-invalid': isError || undefined,
                }
              );
            }
            return child;
          })}
        </div>

        {/* Right Icon */}
        {rightIcon && (
          <span
            className={cn(
              'flex shrink-0 items-center justify-center text-muted-foreground',
              currentSize === 'mini' ? 'pr-1.5' : currentSize === 'sm' ? 'pr-2' : 'pr-3',
              styles.iconClasses
            )}
          >
            {rightIcon}
          </span>
        )}

        {/* Suffix (e.g., ".com", "USD") */}
        {suffix && (
          <span
            className={cn(
              'flex shrink-0 items-center text-muted-foreground bg-gray-50 border-l border-gray-200',
              styles.addonPadding
            )}
          >
            {suffix}
          </span>
        )}

        {/* Addon Right (e.g., Search button) */}
        {addonRight && (
          <div className="flex shrink-0 items-center border-l border-gray-200">{addonRight}</div>
        )}
      </div>
    );
  }
);
InputGroup.displayName = 'InputGroup';

/**
 * InputGroupInput - Unstyled input for use inside InputGroup
 * This is a simple wrapper that removes default input styling
 */
const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full bg-transparent border-0 outline-none',
        'text-foreground placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
});
InputGroupInput.displayName = 'InputGroupInput';

/**
 * InputGroupAddon - Generic add-on slot component
 * Use for buttons or custom elements at the start/end of InputGroup
 */
interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position determines border styling */
  position?: 'left' | 'right';
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, position = 'right', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex shrink-0 items-center',
          position === 'left' ? 'border-r border-gray-200' : 'border-l border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputGroupAddon.displayName = 'InputGroupAddon';

export { InputGroup, InputGroupInput, InputGroupAddon, inputGroupVariants };
