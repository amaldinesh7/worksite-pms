"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { IconProps } from "@phosphor-icons/react"

const SecondaryTabs = Tabs

const SecondaryTabsList = React.forwardRef<
    React.ElementRef<typeof TabsList>,
    React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => (
    <TabsList
        ref={ref}
        variant="secondary"
        className={cn("w-full justify-start border-b border-border bg-transparent p-0", className)}
        {...props}
    />
))
SecondaryTabsList.displayName = "SecondaryTabsList"

interface SecondaryTabsTriggerProps
    extends React.ComponentPropsWithoutRef<typeof TabsTrigger> {
    icon?: React.ComponentType<IconProps>
}

const SecondaryTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsTrigger>,
    SecondaryTabsTriggerProps
>(({ className, icon: Icon, children, ...props }, ref) => (
    <TabsTrigger
        ref={ref}
        variant="secondary"
        className={cn(
            "gap-2 data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground hover:text-foreground",
            className
        )}
        {...props}
    >
        {Icon && <Icon size={16} weight="fill" className="shrink-0" />}
        {children}
    </TabsTrigger>
))
SecondaryTabsTrigger.displayName = "SecondaryTabsTrigger"

const SecondaryTabsContent = TabsContent

export { SecondaryTabs, SecondaryTabsList, SecondaryTabsTrigger, SecondaryTabsContent }
