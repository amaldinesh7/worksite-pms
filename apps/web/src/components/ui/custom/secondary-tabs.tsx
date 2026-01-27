'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { IconProps } from '@phosphor-icons/react';

const SecondaryTabs = TabsPrimitive.Root;

const SecondaryTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex h-auto w-full items-end justify-start gap-0.5 border-b border-border bg-background-secondary p-0',
      className
    )}
    {...props}
  />
));
SecondaryTabsList.displayName = TabsPrimitive.List.displayName;

interface SecondaryTabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  icon?: React.ComponentType<IconProps>;
}

const SecondaryTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  SecondaryTabsTriggerProps
>(({ className, icon: Icon, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles: 44px height, 16px horizontal padding, centered content
      'relative -mb-[1px] flex h-11 items-center justify-center gap-2 cursor-pointer',
      'bg-transparent px-3 py-3',
      // Typography
      'text-sm font-medium',
      // Colors: muted by default, foreground on hover/active
      'text-muted-foreground',
      'transition-colors duration-150',
      // Hover state
      'hover:text-foreground',
      // Active state
      'data-[state=active]:text-foreground',
      // Focus state
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      // Disabled state
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      // Active indicator: 2px bottom border
      "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-transparent after:transition-colors after:duration-150 after:content-['']",
      'data-[state=active]:after:bg-foreground',
      className
    )}
    {...props}
  >
    {Icon && <Icon size={18} weight="fill" className="shrink-0" />}
    <span className="relative z-10">{children}</span>
  </TabsPrimitive.Trigger>
));
SecondaryTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const SecondaryTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
SecondaryTabsContent.displayName = TabsPrimitive.Content.displayName;

export { SecondaryTabs, SecondaryTabsList, SecondaryTabsTrigger, SecondaryTabsContent };
