/**
 * @worksite/ui - Design Tokens
 * SINGLE SOURCE OF TRUTH for all design values across web and mobile
 *
 * Architecture:
 * - rawColors: Color palette from Figma "Raw colors"
 * - semanticColors: Semantic mappings from Figma "Semantic colors"
 * - Web: globals.css CSS variables derived from these values
 * - Mobile: tailwindTheme exported for NativeWind
 */

// =============================================================================
// RAW COLORS (from Figma "Raw colors")
// =============================================================================

export const rawColors = {
  white: '#ffffff',
  black: '#000000',

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },

  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
} as const;

// =============================================================================
// SEMANTIC COLORS (from Figma "Semantic colors")
// =============================================================================

export const semanticColors = {
  // Light mode
  light: {
    // Backgrounds
    background: rawColors.neutral[50], // #fafafa
    foreground: rawColors.neutral[900], // #171717

    // Primary (Brand - Teal)
    primary: rawColors.teal[800], // #115e59 - brand color
    primaryHover: rawColors.teal[900], // #134e4a
    primaryForeground: rawColors.neutral[50], // #fafafa

    // Secondary
    secondary: rawColors.neutral[100], // #f5f5f5
    secondaryHover: rawColors.neutral[200], // #e5e5e5
    secondaryForeground: rawColors.neutral[900], // #171717

    // Muted
    muted: rawColors.neutral[100], // #f5f5f5
    mutedForeground: rawColors.neutral[600], // #525252 (Figma aligned)

    // Accent
    accent: rawColors.neutral[100], // #f5f5f5
    accentForeground: rawColors.neutral[900], // #171717

    // Destructive
    destructive: rawColors.red[600], // #dc2626
    destructiveHover: rawColors.red[700], // #b91c1c
    destructiveForeground: rawColors.white, // #ffffff

    // Borders & Input
    border: rawColors.neutral[200], // #e5e5e5
    input: rawColors.neutral[200], // #e5e5e5

    // Focus Rings (from Figma "focus" section)
    ring: rawColors.neutral[300], // #d4d4d4 - default
    ringPrimary: rawColors.teal[500], // #14b8a6 - interactive elements
    ringError: rawColors.red[300], // #fca5a5 - error states

    // Cards & Popovers
    card: rawColors.white, // #ffffff
    cardForeground: rawColors.neutral[900], // #171717
    popover: rawColors.white, // #ffffff
    popoverForeground: rawColors.neutral[900], // #171717

    // Button-specific (from Figma Design System)
    btnPrimary: rawColors.teal[800], // #115e59
    btnPrimaryHover: rawColors.teal[900], // #134e4a
    btnPrimaryForeground: rawColors.neutral[50], // #fafafa
    btnSecondary: rawColors.neutral[100], // #f5f5f5
    btnSecondaryHover: rawColors.neutral[200], // #e5e5e5
    btnSecondaryForeground: rawColors.neutral[900], // #171717
    btnOutlineBg: 'rgba(255, 255, 255, 0.1)',
    btnOutlineHover: 'rgba(0, 0, 0, 0.04)',
    btnOutlineBorder: rawColors.neutral[300], // #d4d4d4
    btnOutlineForeground: rawColors.neutral[950], // #0a0a0a
    btnGhostBg: 'transparent',
    btnGhostHover: 'rgba(0, 0, 0, 0.04)',
    btnGhostForeground: rawColors.neutral[700], // #404040
    btnDestructive: rawColors.red[600], // #dc2626
    btnDestructiveHover: rawColors.red[700], // #b91c1c
    btnDestructiveForeground: rawColors.white, // #ffffff
    btnFocusRing: rawColors.neutral[300], // #d4d4d4

    // Sidebar
    sidebarBackground: rawColors.white, // #ffffff
    sidebarForeground: rawColors.neutral[700], // #404040
    sidebarPrimary: rawColors.neutral[900], // #171717
    sidebarPrimaryForeground: rawColors.white, // #ffffff
    sidebarAccent: rawColors.neutral[100], // #f5f5f5
    sidebarAccentForeground: rawColors.neutral[900], // #171717
    sidebarBorder: rawColors.neutral[200], // #e5e5e5
    sidebarRing: rawColors.neutral[400], // #a3a3a3
  },

  // Dark mode (placeholder - fill in later from Figma dark mode export)
  dark: {
    background: '', // TODO: Fill from Figma
    foreground: '',

    primary: '',
    primaryHover: '',
    primaryForeground: '',

    secondary: '',
    secondaryHover: '',
    secondaryForeground: '',

    muted: '',
    mutedForeground: '',

    accent: '',
    accentForeground: '',

    destructive: '',
    destructiveHover: '',
    destructiveForeground: '',

    border: '',
    input: '',

    ring: '',
    ringPrimary: '',
    ringError: '',

    card: '',
    cardForeground: '',
    popover: '',
    popoverForeground: '',

    btnPrimary: '',
    btnPrimaryHover: '',
    btnPrimaryForeground: '',
    btnSecondary: '',
    btnSecondaryHover: '',
    btnSecondaryForeground: '',
    btnOutlineBg: '',
    btnOutlineHover: '',
    btnOutlineBorder: '',
    btnOutlineForeground: '',
    btnGhostBg: '',
    btnGhostHover: '',
    btnGhostForeground: '',
    btnDestructive: '',
    btnDestructiveHover: '',
    btnDestructiveForeground: '',
    btnFocusRing: '',

    sidebarBackground: '',
    sidebarForeground: '',
    sidebarPrimary: '',
    sidebarPrimaryForeground: '',
    sidebarAccent: '',
    sidebarAccentForeground: '',
    sidebarBorder: '',
    sidebarRing: '',
  },
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
  sans: [
    'Figtree',
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif',
  ],
  mono: [
    'Geist',
    'Geist Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ],
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
  sidebarWidth: 256, // w-64 in Tailwind
  sidebarCollapsed: 64, // w-16 in Tailwind
  headerHeight: 64,
} as const;

// =============================================================================
// HELPER FUNCTIONS
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

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generate CSS variable string for globals.css
 * Usage: Copy output to @layer base { :root { ... } }
 */
export function generateCSSVariables(mode: 'light' | 'dark' = 'light'): string {
  const colors = semanticColors[mode];
  return Object.entries(colors)
    .filter(([, value]) => value !== '') // Skip empty dark mode placeholders
    .map(([key, value]) => `    --${camelToKebab(key)}: ${value};`)
    .join('\n');
}

// =============================================================================
// TAILWIND THEME (for NativeWind / Mobile)
// =============================================================================

const lightColors = semanticColors.light;

/**
 * Tailwind theme configuration
 * Import in tailwind.config.js: import { tailwindTheme } from '@worksite/ui/tokens'
 */
export const tailwindTheme = {
  colors: {
    // Raw color scales (for utilities like bg-teal-500)
    neutral: rawColors.neutral,
    teal: rawColors.teal,
    red: rawColors.red,
    orange: rawColors.orange,
    amber: rawColors.amber,
    green: rawColors.green,
    blue: rawColors.blue,
    zinc: rawColors.zinc,
    white: rawColors.white,
    black: rawColors.black,
    transparent: 'transparent',

    // Semantic colors (mapped from light mode)
    background: lightColors.background,
    foreground: lightColors.foreground,

    primary: {
      DEFAULT: lightColors.primary,
      hover: lightColors.primaryHover,
      foreground: lightColors.primaryForeground,
    },

    secondary: {
      DEFAULT: lightColors.secondary,
      hover: lightColors.secondaryHover,
      foreground: lightColors.secondaryForeground,
    },

    muted: {
      DEFAULT: lightColors.muted,
      foreground: lightColors.mutedForeground,
    },

    accent: {
      DEFAULT: lightColors.accent,
      foreground: lightColors.accentForeground,
    },

    destructive: {
      DEFAULT: lightColors.destructive,
      hover: lightColors.destructiveHover,
      foreground: lightColors.destructiveForeground,
    },

    border: lightColors.border,
    input: lightColors.input,

    ring: {
      DEFAULT: lightColors.ring,
      primary: lightColors.ringPrimary,
      error: lightColors.ringError,
    },

    card: {
      DEFAULT: lightColors.card,
      foreground: lightColors.cardForeground,
    },

    popover: {
      DEFAULT: lightColors.popover,
      foreground: lightColors.popoverForeground,
    },
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

// Legacy exports for backwards compatibility
export const colors = {
  primary: {
    DEFAULT: lightColors.primary,
    light: lightColors.primaryHover,
    dark: rawColors.teal[950],
  },
  background: {
    DEFAULT: rawColors.white,
    secondary: rawColors.neutral[50],
    tertiary: rawColors.neutral[100],
  },
  text: {
    DEFAULT: lightColors.foreground,
    secondary: lightColors.mutedForeground,
    tertiary: rawColors.neutral[300],
    inverse: rawColors.white,
  },
  border: {
    DEFAULT: lightColors.border,
    light: rawColors.neutral[100],
    dark: rawColors.neutral[300],
  },
  success: {
    DEFAULT: rawColors.green[500],
    light: rawColors.green[100],
    dark: rawColors.green[800],
  },
  warning: {
    DEFAULT: rawColors.orange[500],
    light: rawColors.amber[100],
    dark: rawColors.amber[800],
  },
  error: { DEFAULT: rawColors.red[500], light: rawColors.red[100], dark: rawColors.red[800] },
  info: { DEFAULT: rawColors.blue[500], light: rawColors.blue[100], dark: rawColors.blue[800] },
  gray: rawColors.neutral,
  white: rawColors.white,
  black: rawColors.black,
  transparent: 'transparent',
} as const;
