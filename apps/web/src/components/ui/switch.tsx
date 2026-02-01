import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base styles: 32×16px track
      'peer inline-flex h-4 w-8 shrink-0 cursor-pointer items-center',
      'rounded-full',
      // Border and background
      'border border-transparent',
      // Transition for smooth state changes
      'transition-all duration-150',
      // Unchecked state: neutral-300 background (light gray)
      'data-[state=unchecked]:bg-neutral-300',
      // Checked state: btn-primary (teal) background
      'data-[state=checked]:bg-btn-primary',
      // Hover states
      'hover:data-[state=unchecked]:bg-neutral-400',
      'hover:data-[state=checked]:bg-btn-primary-hover',
      // Focus state - uses btn-focus-ring color
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btn-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Base styles: 12×12px thumb
        'pointer-events-none block h-3 w-3 rounded-full',
        // Background and shadow
        'bg-white shadow-sm',
        // Transition for smooth movement
        'transition-transform duration-150',
        // Position: 2px padding from edges
        // Unchecked: 2px from left
        'data-[state=unchecked]:translate-x-0.5',
        // Checked: move to right (32px track - 12px thumb - 2px padding = 18px, but with padding adjustments)
        'data-[state=checked]:translate-x-[18px]'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
