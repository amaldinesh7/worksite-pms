/**
 * @worksite/ui - Design Tokens
 * Single source of truth for all design values across web and mobile
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Brand / Primary
  primary: {
    DEFAULT: '#1A1A1A',
    light: '#333333',
    dark: '#000000',
  },
  // Background
  background: {
    DEFAULT: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
  },
  // Text
  text: {
    DEFAULT: '#1A1A1A',
    secondary: '#8E8E93',
    tertiary: '#CCCCCC',
    inverse: '#FFFFFF',
  },
  // Border
  border: {
    DEFAULT: '#E5E5E5',
    light: '#F0F0F0',
    dark: '#CCCCCC',
  },
  // Semantic
  success: { DEFAULT: '#34C759', light: '#D1FAE5', dark: '#166534' },
  warning: { DEFAULT: '#FF9500', light: '#FEF3C7', dark: '#92400E' },
  error: { DEFAULT: '#FF3B30', light: '#FEE2E2', dark: '#991B1B' },
  info: { DEFAULT: '#007AFF', light: '#DBEAFE', dark: '#1E40AF' },
  // Gray scale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// =============================================================================
// SPACING (in pixels)
// =============================================================================

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fontFamily = {
  sans: ['Figtree', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  mono: ['Geist', 'Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
} as const;

// =============================================================================
// BORDER RADIUS (in pixels)
// =============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  DEFAULT: 8,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const boxShadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// =============================================================================
// LAYOUT DIMENSIONS (in pixels)
// =============================================================================

export const layout = {
  sidebarWidth: 256,       // w-64 in Tailwind
  sidebarCollapsed: 64,    // w-16 in Tailwind
  headerHeight: 64,
} as const;

// =============================================================================
// TAILWIND THEME GENERATOR
// =============================================================================

function pxToRem(px: number): string {
  return `${px / 16}rem`;
}

function spacingToRem(obj: Record<string | number, number>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, pxToRem(v)]));
}

function fontSizeToRem(
  obj: Record<string, number>
): Record<string, [string, { lineHeight: string }]> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, [pxToRem(v), { lineHeight: '1.5' }]])
  );
}

function radiusToRem(obj: Record<string, number>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === 9999 ? '9999px' : pxToRem(v)])
  );
}

/**
 * Tailwind theme configuration
 * Import in tailwind.config.js: import { tailwindTheme } from '@worksite/ui/tokens'
 */
export const tailwindTheme = {
  colors: {
    primary: colors.primary.DEFAULT,
    'primary-light': colors.primary.light,
    'primary-dark': colors.primary.dark,
    background: colors.background.DEFAULT,
    'background-secondary': colors.background.secondary,
    'background-tertiary': colors.background.tertiary,
    foreground: colors.text.DEFAULT,
    'foreground-secondary': colors.text.secondary,
    'foreground-tertiary': colors.text.tertiary,
    'foreground-inverse': colors.text.inverse,
    border: colors.border.DEFAULT,
    'border-light': colors.border.light,
    'border-dark': colors.border.dark,
    success: colors.success.DEFAULT,
    'success-light': colors.success.light,
    warning: colors.warning.DEFAULT,
    'warning-light': colors.warning.light,
    error: colors.error.DEFAULT,
    'error-light': colors.error.light,
    destructive: colors.error.DEFAULT,
    'destructive-foreground': colors.white,
    info: colors.info.DEFAULT,
    'info-light': colors.info.light,
    gray: colors.gray,
    white: colors.white,
    black: colors.black,
    transparent: colors.transparent,
    card: colors.white,
    'card-foreground': colors.text.DEFAULT,
    popover: colors.white,
    'popover-foreground': colors.text.DEFAULT,
    muted: colors.gray[100],
    'muted-foreground': colors.text.secondary,
    accent: colors.gray[100],
    'accent-foreground': colors.text.DEFAULT,
    input: colors.border.DEFAULT,
    ring: colors.primary.DEFAULT,
  },
  spacing: spacingToRem(spacing),
  fontSize: fontSizeToRem(fontSize),
  fontWeight,
  fontFamily: {
    sans: fontFamily.sans.join(', '),
    mono: fontFamily.mono.join(', '),
  },
  borderRadius: radiusToRem(borderRadius),
  boxShadow,
} as const;
