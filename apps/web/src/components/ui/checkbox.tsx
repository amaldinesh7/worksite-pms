import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles: 20×20px, 4px border-radius
      'peer grid h-5 w-5 shrink-0 place-content-center',
      'rounded border-2 border-neutral-300',
      'bg-background',
      // Transition for smooth state changes
      'transition-all duration-150',
      // Hover state (unchecked)
      'hover:border-primary-400',
      // Focus state - uses ring-primary (teal.500) for interactive elements
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-300',
      // Checked state - uses btn-primary (teal) color
      'data-[state=checked]:bg-btn-primary data-[state=checked]:border-none data-[state=checked]:text-btn-primary-foreground ',
      'data-[state=checked]:hover:bg-btn-primary-hover',
      // Indeterminate state - same as checked
      'data-[state=indeterminate]:bg-btn-primary data-[state=indeterminate]:border-btn-primary data-[state=indeterminate]:text-btn-primary-foreground',
      'data-[state=indeterminate]:hover:bg-btn-primary-hover data-[state=indeterminate]:hover:border-btn-primary-hover',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('grid place-content-center text-current')}>
      {/* Show minus for indeterminate, check for checked */}
      <CheckIcon />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Internal component to handle check vs indeterminate icon
function CheckIcon() {
  return (
    <>
      <Check className="h-3.5 w-3.5 stroke-3 in-data-[state=indeterminate]:hidden" />
      <Minus className="h-3.5 w-3.5 stroke-3 in-data-[state=checked]:hidden in-data-[state=unchecked]:hidden" />
    </>
  );
}

export { Checkbox };
