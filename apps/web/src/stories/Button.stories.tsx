import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Plus,
  ArrowRight,
  MagnifyingGlass,
  Trash,
  EnvelopeSimple,
  Check,
  Pencil,
  Gear,
} from '@phosphor-icons/react';

import { Button } from '../components/ui/button';

/**
 * Button component with variants, sizes, and icon support.
 *
 * ## Usage
 *
 * ```tsx
 * import { Button } from '@/components/ui/button';
 *
 * // Basic button
 * <Button>Click me</Button>
 *
 * // With variant
 * <Button variant="secondary">Secondary</Button>
 * <Button variant="destructive">Delete</Button>
 *
 * // With icons
 * <Button leftIcon={<Plus />}>Add Item</Button>
 * <Button rightIcon={<ArrowRight />}>Continue</Button>
 *
 * // Different sizes
 * <Button size="lg">Large</Button>
 * <Button size="sm">Small</Button>
 *
 * // Icon-only button
 * <Button size="icon" aria-label="Settings">
 *   <Gear />
 * </Button>
 *
 * // Loading state
 * <Button isLoading>Saving...</Button>
 * ```
 *
 * ## Props
 *
 * - **variant**: `primary` | `secondary` | `outline` | `ghost` | `destructive` | `link`
 * - **size**: `default` (36px) | `lg` (44px) | `sm` (32px) | `mini` (24px) | `icon` | `iconLg` | `iconSm` | `iconMini`
 * - **leftIcon**: Icon element to display before text
 * - **rightIcon**: Icon element to display after text
 * - **isLoading**: Shows spinner and disables button
 * - Plus all standard button HTML attributes
 */
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['default', 'lg', 'sm', 'mini', 'icon', 'iconLg', 'iconSm', 'iconMini'],
      description: 'Button size',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state with spinner',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// PLAYGROUND
// =============================================================================

/**
 * Interactive playground to test all button props.
 * Use the controls panel to experiment with different configurations.
 */
export const Playground: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
};

// =============================================================================
// VARIANTS
// =============================================================================

/**
 * All button variants showing different visual styles.
 * - **Primary**: Main action, high emphasis
 * - **Secondary**: Alternative action, medium emphasis
 * - **Outline**: Bordered style, low emphasis
 * - **Ghost**: Minimal style, for toolbar/nav actions
 * - **Destructive**: Dangerous actions like delete
 * - **Link**: Text-only link style
 */
export const Variants: Story = {
  name: 'Variants',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// =============================================================================
// SIZES
// =============================================================================

/**
 * Button sizes from largest to smallest.
 * Each size has appropriate padding and font size.
 */
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Button size="lg">Large</Button>
        <span className="text-xs text-muted-foreground">44px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="default">Default</Button>
        <span className="text-xs text-muted-foreground">36px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="sm">Small</Button>
        <span className="text-xs text-muted-foreground">32px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="mini">Mini</Button>
        <span className="text-xs text-muted-foreground">24px</span>
      </div>
    </div>
  ),
};

/**
 * Buttons with icons scale appropriately based on size.
 * Icons use: lg=20px, default=16px, sm=16px, mini=14px.
 */
export const SizesWithIcons: Story = {
  name: 'Sizes with Icons',
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <Button size="lg" leftIcon={<Check weight="bold" />}>
        Large
      </Button>
      <Button size="default" leftIcon={<Check weight="bold" />}>
        Default
      </Button>
      <Button size="sm" leftIcon={<Check weight="bold" />}>
        Small
      </Button>
      <Button size="mini" leftIcon={<Check weight="bold" />}>
        Mini
      </Button>
    </div>
  ),
};

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * Icon placement options: left, right, or both.
 * Use leftIcon for primary actions, rightIcon for navigation hints.
 */
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button leftIcon={<Plus weight="bold" />}>Add Item</Button>
      <Button rightIcon={<ArrowRight weight="bold" />}>Continue</Button>
      <Button leftIcon={<EnvelopeSimple weight="bold" />} rightIcon={<ArrowRight weight="bold" />}>
        Send Email
      </Button>
    </div>
  ),
};

// =============================================================================
// STATES
// =============================================================================

/**
 * Normal, disabled, and loading states across variants.
 * Loading state shows a spinner and disables interaction.
 */
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-20 text-sm font-medium">Normal:</span>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-20 text-sm font-medium">Disabled:</span>
        <Button variant="primary" disabled>
          Primary
        </Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
        <Button variant="outline" disabled>
          Outline
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-20 text-sm font-medium">Loading:</span>
        <Button variant="primary" isLoading>
          Primary
        </Button>
        <Button variant="secondary" isLoading>
          Secondary
        </Button>
        <Button variant="outline" isLoading>
          Outline
        </Button>
      </div>
    </div>
  ),
};

// =============================================================================
// ICON BUTTONS
// =============================================================================

/**
 * Square icon-only buttons for toolbars and compact UIs.
 * Always include aria-label for accessibility.
 */
export const IconButtonSizes: Story = {
  name: 'Icon Buttons / Sizes',
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Button size="iconLg" aria-label="Add">
          <Plus weight="bold" />
        </Button>
        <span className="text-xs text-muted-foreground">40×40</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="icon" aria-label="Add">
          <Plus weight="bold" />
        </Button>
        <span className="text-xs text-muted-foreground">36×36</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="iconSm" aria-label="Add">
          <Plus weight="bold" />
        </Button>
        <span className="text-xs text-muted-foreground">32×32</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="iconMini" aria-label="Add">
          <Plus weight="bold" />
        </Button>
        <span className="text-xs text-muted-foreground">24×24</span>
      </div>
    </div>
  ),
};

/**
 * Icon buttons in all variant styles.
 */
export const IconButtonVariants: Story = {
  name: 'Icon Buttons / Variants',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary" size="icon" aria-label="Add">
        <Plus weight="bold" />
      </Button>
      <Button variant="secondary" size="icon" aria-label="Search">
        <MagnifyingGlass weight="bold" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Settings">
        <Gear weight="bold" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Edit">
        <Pencil weight="bold" />
      </Button>
      <Button variant="destructive" size="icon" aria-label="Delete">
        <Trash weight="bold" />
      </Button>
    </div>
  ),
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Form action button pattern - Cancel and Save.
 * Use outline for secondary action, primary for main action.
 */
export const FormActions: Story = {
  name: 'Form Actions',
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Save Changes</Button>
    </div>
  ),
};

/**
 * Destructive action dialog pattern.
 * Use ghost for Cancel, destructive for dangerous action.
 */
export const DialogActions: Story = {
  name: 'Dialog Actions',
  render: () => (
    <div className="flex w-80 items-center justify-end gap-3 border-t pt-4">
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive" leftIcon={<Trash weight="bold" />}>
        Delete Project
      </Button>
    </div>
  ),
};

/**
 * Page header with primary action button.
 */
export const PageHeader: Story = {
  name: 'Page Header',
  render: () => (
    <div className="flex w-96 items-center justify-between border-b pb-4">
      <h1 className="text-lg font-semibold">Projects</h1>
      <Button variant="primary" leftIcon={<Plus weight="bold" />}>
        New Project
      </Button>
    </div>
  ),
};
