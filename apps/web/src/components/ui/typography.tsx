import { cn } from "@/lib/utils";
import React, { forwardRef } from 'react';

// ============================================================================
// TYPOGRAPHY COMPONENTS
// Based on shadcn/ui typography patterns
// ============================================================================

export const TypographyH1 = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => {
        return (
            <h1
                ref={ref}
                className={cn(
                    "scroll-m-20 text-4xl font-extrabold  lg:text-5xl font-heading",
                    className
                )}
                {...props}
            />
        );
    }
);
TypographyH1.displayName = "TypographyH1";

export const TypographyH2 = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => {
        return (
            <h2
                ref={ref}
                className={cn(
                    "scroll-m-20 border-b pb-2 text-3xl font-semibold first:mt-0 font-heading",
                    className
                )}
                {...props}
            />
        );
    }
);
TypographyH2.displayName = "TypographyH2";

export const TypographyH3 = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={cn(
                    "scroll-m-20 text-2xl font-semibold font-heading",
                    className
                )}
                {...props}
            />
        );
    }
);
TypographyH3.displayName = "TypographyH3";

export const TypographyH4 = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => {
        return (
            <h4
                ref={ref}
                className={cn(
                    "scroll-m-20 text-xl font-semibold  font-heading",
                    className
                )}
                {...props}
            />
        );
    }
);
TypographyH4.displayName = "TypographyH4";

export const TypographyP = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn("leading-7 [&:not(:first-child)]:mt-6 font-body", className)}
                {...props}
            />
        );
    }
);
TypographyP.displayName = "TypographyP";

export const TypographyBlockquote = forwardRef<HTMLQuoteElement, React.HTMLAttributes<HTMLQuoteElement>>(
    ({ className, ...props }, ref) => {
        return (
            <blockquote
                ref={ref}
                className={cn("mt-6 border-l-2 pl-6 italic font-body", className)}
                {...props}
            />
        );
    }
);
TypographyBlockquote.displayName = "TypographyBlockquote";

export const TypographyLead = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn("text-xl text-muted-foreground font-body", className)}
                {...props}
            />
        );
    }
);
TypographyLead.displayName = "TypographyLead";

export const TypographyLarge = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("text-lg font-semibold font-body", className)}
                {...props}
            />
        );
    }
);
TypographyLarge.displayName = "TypographyLarge";

export const TypographySmall = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, ...props }, ref) => {
        return (
            <small
                ref={ref}
                className={cn("text-sm font-medium leading-none font-body", className)}
                {...props}
            />
        );
    }
);
TypographySmall.displayName = "TypographySmall";

export const TypographyMuted = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn("text-sm text-muted-foreground font-body", className)}
                {...props}
            />
        );
    }
);
TypographyMuted.displayName = "TypographyMuted";
