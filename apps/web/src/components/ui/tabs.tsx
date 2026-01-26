'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

// TabsList variants
const tabsListVariants = cva(
  'inline-flex items-center justify-center bg-muted p-0.5 text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'rounded-lg',
        default: 'rounded-[10px]',
        lg: 'rounded-xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, size, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ size }), className)}
      {...props}
    />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

// TabsTrigger variants
const tabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap font-medium',
    'ring-offset-background transition-all',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[state=inactive]:hover:bg-muted',
    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-5 gap-1 px-1.5 py-0.5 text-xs rounded-md',
        default: 'min-h-8 gap-1.5 px-2 py-1 text-sm rounded-lg',
        lg: 'min-h-8 gap-2 px-2.5 py-2 text-sm rounded-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

// Internal counter badge component
function TabsCounter({ count }: { count: number }) {
  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-300 px-1 text-xs font-semibold">
      {count}
    </span>
  );
}

interface TabsTriggerProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  icon?: React.ReactNode;
  counter?: number;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, size, icon, counter, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ size }), className)}
    {...props}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    {children}
    {counter !== undefined && <TabsCounter count={counter} />}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
