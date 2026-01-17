"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { IconProps } from "@phosphor-icons/react"

const SecondaryTabs = TabsPrimitive.Root

const SecondaryTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "flex h-auto w-full items-end justify-start gap-0 border-b border-border bg-transparent p-0",
            className
        )}
        {...props}
    />
))
SecondaryTabsList.displayName = TabsPrimitive.List.displayName

interface SecondaryTabsTriggerProps
    extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
    icon?: React.ComponentType<IconProps>
}

const SecondaryTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    SecondaryTabsTriggerProps
>(({ className, icon: Icon, children, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "relative -mb-[1px] flex h-12 items-center justify-center gap-2 bg-transparent px-4 pb-3 pt-4 text-sm font-medium text-muted-foreground transition-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:after:bg-foreground",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-transparent after:content-['']",
            className
        )}
        {...props}
    >
        {Icon && <Icon size={18} weight="fill" className="shrink-0" />}
        <span className="relative z-10">{children}</span>
    </TabsPrimitive.Trigger>
))
SecondaryTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const SecondaryTabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
))
SecondaryTabsContent.displayName = TabsPrimitive.Content.displayName

export { SecondaryTabs, SecondaryTabsList, SecondaryTabsTrigger, SecondaryTabsContent }
