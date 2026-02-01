import { cn } from "@/lib/utils";
import React from 'react';

// ============================================================================
// TYPOGRAPHY COMPONENT
// Single polymorphic component with variant prop
// Based on Figma Design System - WorkSite PMS
// ============================================================================

/**
 * Available typography variants matching Figma design tokens
 */
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'paragraph'
  | 'paragraph-medium'
  | 'paragraph-bold'
  | 'paragraph-small'
  | 'paragraph-small-medium'
  | 'paragraph-mini'
  | 'paragraph-mini-medium'
  | 'paragraph-mini-bold'
  | 'monospace'
  | 'lead'
  | 'muted'
  | 'blockquote';

/**
 * Variant styles mapped from Figma design tokens
 * Font: Figtree (headings & body), Geist (monospace)
 * 
 * Uses explicit pixel values for font-size to guarantee exact Figma specs
 * regardless of root font-size or rem calculations.
 */
const variantStyles: Record<TypographyVariant, string> = {
  // Headings - Figtree, weight 600 (semibold)
  h1: 'scroll-m-20 text-[48px] font-semibold leading-[48px] tracking-[-1.5px] font-heading',
  h2: 'scroll-m-20 text-[30px] font-semibold leading-[30px] tracking-[-1px] font-heading',
  h3: 'scroll-m-20 text-[24px] font-semibold leading-[28.8px] tracking-[-1px] font-heading',
  h4: 'scroll-m-20 text-[20px] font-semibold leading-[24px] tracking-normal font-heading',

  // Paragraph Regular - 16px / 24px line-height
  paragraph: 'text-[16px] font-normal leading-[24px] tracking-normal font-body',
  'paragraph-medium': 'text-[16px] font-medium leading-[24px] tracking-normal font-body',
  'paragraph-bold': 'text-[16px] font-semibold leading-[24px] tracking-normal font-body',

  // Paragraph Small - 14px / 20px line-height
  'paragraph-small': 'text-[14px] font-normal leading-[20px] tracking-normal font-body',
  'paragraph-small-medium': 'text-[14px] font-medium leading-[20px] tracking-normal font-body',

  // Paragraph Mini - 12px / 16px line-height
  'paragraph-mini': 'text-[12px] font-normal leading-[16px] tracking-normal font-body',
  'paragraph-mini-medium': 'text-[12px] font-medium leading-[16px] tracking-normal font-body',
  'paragraph-mini-bold': 'text-[12px] font-semibold leading-[16px] tracking-normal font-body',

  // Monospace - Geist font, 16px / 24px line-height
  monospace: 'text-[16px] font-normal leading-[24px] tracking-normal font-mono',

  // Utility variants
  lead: 'text-[20px] leading-[28px] text-muted-foreground font-body',
  muted: 'text-[14px] leading-[20px] text-muted-foreground font-body',
  blockquote: 'mt-6 border-l-2 pl-6 italic text-[16px] leading-[24px] font-body',
};

/**
 * Default HTML element for each variant
 */
const defaultElements: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  paragraph: 'p',
  'paragraph-medium': 'p',
  'paragraph-bold': 'p',
  'paragraph-small': 'p',
  'paragraph-small-medium': 'p',
  'paragraph-mini': 'p',
  'paragraph-mini-medium': 'p',
  'paragraph-mini-bold': 'p',
  monospace: 'code',
  lead: 'p',
  muted: 'p',
  blockquote: 'blockquote',
};

/**
 * Typography component props
 */
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** The typography variant to apply */
  variant: TypographyVariant;
  /** Override the default HTML element */
  as?: React.ElementType;
  /** Content to render */
  children?: React.ReactNode;
}

/**
 * Typography Component
 *
 * A polymorphic typography component that renders text with consistent styling
 * based on the Figma design system.
 *
 * @example
 * // Basic usage - renders as default element for variant
 * <Typography variant="h1">Page Title</Typography>
 *
 * @example
 * // Polymorphic - render as different element
 * <Typography variant="paragraph-small" as="span">Badge text</Typography>
 *
 * @example
 * // With additional className
 * <Typography variant="muted" className="mt-2">Helper text</Typography>
 */
export function Typography({
  variant,
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const Component = as || defaultElements[variant];

  return (
    <Component
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

Typography.displayName = 'Typography';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Get typography classes for a variant (useful for applying to other components)
 */
export function getTypographyClasses(variant: TypographyVariant): string {
  return variantStyles[variant];
}

/**
 * All available variants (useful for documentation/storybook)
 */
export const typographyVariants = Object.keys(variantStyles) as TypographyVariant[];
