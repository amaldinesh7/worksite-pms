import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  MagnifyingGlass,
  Globe,
  Info,
  Phone,
  CreditCard,
  Link,
  Copy,
  Eye,
} from '@phosphor-icons/react';

import { InputGroup, InputGroupInput } from '../components/ui/input-group';
import { Button } from '../components/ui/button';

/**
 * InputGroup component for composing inputs with add-ons.
 *
 * ## Usage
 *
 * ```tsx
 * import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
 *
 * // With prefix text
 * <InputGroup prefix="https://">
 *   <InputGroupInput placeholder="example.com" />
 * </InputGroup>
 *
 * // With suffix text
 * <InputGroup suffix="USD">
 *   <InputGroupInput placeholder="0.00" type="number" />
 * </InputGroup>
 *
 * // With icons
 * <InputGroup leftIcon={<Globe />}>
 *   <InputGroupInput placeholder="Website" />
 * </InputGroup>
 *
 * // With button addon
 * <InputGroup addonRight={<Button>Search</Button>}>
 *   <InputGroupInput placeholder="Search..." />
 * </InputGroup>
 * ```
 *
 * ## Props
 *
 * - **inputSize**: `default` (36px) | `lg` (40px) | `sm` (32px) | `mini` (24px)
 * - **isError**: Shows red border and focus ring for error state
 * - **prefix**: Text/element before the input (e.g., "https://", "$")
 * - **suffix**: Text/element after the input (e.g., ".com", "USD")
 * - **leftIcon**: Icon inside the input on the left
 * - **rightIcon**: Icon inside the input on the right
 * - **addonLeft**: Button/element attached to the left
 * - **addonRight**: Button/element attached to the right
 */
const meta: Meta<typeof InputGroup> = {
  title: 'UI/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    inputSize: {
      control: 'select',
      options: ['default', 'lg', 'sm', 'mini'],
      description: 'Input size: default (36px), lg (40px), sm (32px), mini (24px)',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    isError: {
      control: 'boolean',
      description: 'Error state with red border and focus ring',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    prefix: {
      control: 'text',
      description: 'Text prefix (e.g., "https://", "$")',
    },
    suffix: {
      control: 'text',
      description: 'Text suffix (e.g., ".com", "USD")',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// PLAYGROUND
// =============================================================================

/**
 * Interactive playground to test all InputGroup props.
 * Use the controls panel to experiment with prefix, suffix, and size.
 */
export const Playground: Story = {
  args: {
    inputSize: 'default',
    isError: false,
    prefix: 'https://',
    suffix: '.com',
  },
  render: (args) => (
    <div className="w-96">
      <InputGroup {...args}>
        <InputGroupInput placeholder="domain" />
      </InputGroup>
    </div>
  ),
};

// =============================================================================
// PREFIX & SUFFIX
// =============================================================================

/**
 * Text prefixes and suffixes for common input patterns.
 * Prefixes/suffixes have a subtle gray background to distinguish them.
 */
export const PrefixAndSuffix: Story = {
  name: 'Prefix & Suffix',
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Prefix Only</span>
        <InputGroup prefix="https://">
          <InputGroupInput placeholder="example.com" />
        </InputGroup>
        <InputGroup prefix="$">
          <InputGroupInput placeholder="0.00" type="number" />
        </InputGroup>
        <InputGroup prefix="+1">
          <InputGroupInput placeholder="(555) 123-4567" type="tel" />
        </InputGroup>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Suffix Only</span>
        <InputGroup suffix=".com">
          <InputGroupInput placeholder="domain" />
        </InputGroup>
        <InputGroup suffix="USD">
          <InputGroupInput placeholder="0.00" type="number" />
        </InputGroup>
        <InputGroup suffix="%">
          <InputGroupInput placeholder="100" type="number" />
        </InputGroup>
        <InputGroup suffix="kg">
          <InputGroupInput placeholder="Weight" type="number" />
        </InputGroup>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Both Prefix & Suffix</span>
        <InputGroup prefix="https://" suffix=".com">
          <InputGroupInput placeholder="domain" />
        </InputGroup>
        <InputGroup prefix="$" suffix="USD">
          <InputGroupInput placeholder="0.00" type="number" />
        </InputGroup>
      </div>
    </div>
  ),
};

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * Icons inside the input area (different from prefix/suffix).
 * Icons scale automatically based on input size.
 */
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <InputGroup leftIcon={<Globe />} suffix=".com">
        <InputGroupInput placeholder="website" />
      </InputGroup>
      <InputGroup prefix="https://" rightIcon={<Info />}>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
      <InputGroup leftIcon={<MagnifyingGlass />}>
        <InputGroupInput placeholder="Search..." />
      </InputGroup>
    </div>
  ),
};

// =============================================================================
// WITH BUTTON ADDONS
// =============================================================================

/**
 * Button add-ons attached to the input.
 * Buttons should use rounded-none and match the input height.
 */
export const WithButtonAddons: Story = {
  name: 'With Button Addons',
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <InputGroup
          leftIcon={<MagnifyingGlass />}
          addonRight={
            <Button variant="primary" size="sm" className="rounded-none rounded-r-lg h-full">
              Search
            </Button>
          }
        >
          <InputGroupInput placeholder="Search..." />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Search with button</span>
      </div>
      <div className="flex flex-col gap-1">
        <InputGroup
          addonRight={
            <Button variant="secondary" size="sm" className="rounded-none rounded-r-lg h-full">
              <Copy className="size-4" />
            </Button>
          }
        >
          <InputGroupInput defaultValue="https://worksite.app/invite/abc123" readOnly />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Copy link</span>
      </div>
      <div className="flex flex-col gap-1">
        <InputGroup
          addonRight={
            <Button variant="outline" size="sm" className="rounded-none rounded-r-lg h-full border-0 border-l">
              <Eye className="size-4" />
            </Button>
          }
        >
          <InputGroupInput type="password" placeholder="Password" />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Password with toggle</span>
      </div>
      <div className="flex flex-col gap-1">
        <InputGroup
          addonLeft={
            <Button variant="secondary" size="sm" className="rounded-none rounded-l-lg h-full">
              Browse
            </Button>
          }
        >
          <InputGroupInput placeholder="Select file..." readOnly />
        </InputGroup>
        <span className="text-xs text-muted-foreground">File browser</span>
      </div>
    </div>
  ),
};

// =============================================================================
// SIZES
// =============================================================================

/**
 * All input group sizes with prefix and suffix.
 */
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <InputGroup inputSize="lg" prefix="$" suffix="USD">
          <InputGroupInput placeholder="Large (40px)" />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Large - 40px</span>
      </div>
      <div className="flex flex-col gap-1">
        <InputGroup inputSize="default" prefix="$" suffix="USD">
          <InputGroupInput placeholder="Default (36px)" />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Default - 36px</span>
      </div>
      <div className="flex flex-col gap-1">
        <InputGroup inputSize="sm" prefix="$" suffix="USD">
          <InputGroupInput placeholder="Small (32px)" />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Small - 32px</span>
      </div>
      <div className="flex flex-col gap-1">
        <InputGroup inputSize="mini" prefix="$" suffix="USD">
          <InputGroupInput placeholder="Mini (24px)" />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Mini - 24px</span>
      </div>
    </div>
  ),
};

// =============================================================================
// STATES
// =============================================================================

/**
 * Normal, error, and disabled states.
 * Focus on error inputs to see the red focus ring.
 */
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <InputGroup prefix="https://">
          <InputGroupInput placeholder="Normal state" />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Normal</span>
      </div>
      <div className="flex flex-col gap-1">
        <InputGroup prefix="https://" isError>
          <InputGroupInput placeholder="Error state" />
        </InputGroup>
        <span className="text-xs text-red-500">Invalid URL format</span>
      </div>
      <div className="flex flex-col gap-1">
        <InputGroup prefix="https://">
          <InputGroupInput placeholder="Disabled state" disabled />
        </InputGroup>
        <span className="text-xs text-muted-foreground">Disabled</span>
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * URL input pattern with protocol prefix and domain suffix.
 */
export const URLInput: Story = {
  name: 'URL Input',
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <label className="text-sm font-medium">Website URL</label>
      <InputGroup prefix="https://" suffix=".com" leftIcon={<Globe />}>
        <InputGroupInput placeholder="your-website" />
      </InputGroup>
      <span className="text-xs text-muted-foreground">Enter your website address</span>
    </div>
  ),
};

/**
 * Currency input pattern with symbol and currency code.
 */
export const CurrencyInput: Story = {
  name: 'Currency Input',
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <label className="text-sm font-medium">Price</label>
      <InputGroup prefix="$" suffix="USD">
        <InputGroupInput placeholder="0.00" type="number" step="0.01" />
      </InputGroup>
      <span className="text-xs text-muted-foreground">Enter amount in USD</span>
    </div>
  ),
};

/**
 * Search with button pattern for search forms.
 */
export const SearchWithButton: Story = {
  name: 'Search with Button',
  render: () => (
    <div className="w-96">
      <InputGroup
        leftIcon={<MagnifyingGlass />}
        addonRight={
          <Button variant="primary" className="rounded-none rounded-r-lg h-full">
            Search
          </Button>
        }
      >
        <InputGroupInput placeholder="Search projects, tasks, team members..." />
      </InputGroup>
    </div>
  ),
};

/**
 * Phone number input with country code prefix.
 */
export const PhoneNumber: Story = {
  name: 'Phone Number',
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <label className="text-sm font-medium">Phone Number</label>
      <InputGroup prefix="+1" leftIcon={<Phone />}>
        <InputGroupInput placeholder="(555) 123-4567" type="tel" />
      </InputGroup>
    </div>
  ),
};

/**
 * Credit card input pattern.
 */
export const CreditCardInput: Story = {
  name: 'Credit Card',
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <label className="text-sm font-medium">Card Number</label>
      <InputGroup leftIcon={<CreditCard />}>
        <InputGroupInput placeholder="4242 4242 4242 4242" />
      </InputGroup>
    </div>
  ),
};

/**
 * Shareable link with copy button.
 */
export const ShareableLink: Story = {
  name: 'Shareable Link',
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <label className="text-sm font-medium">Share Link</label>
      <InputGroup
        leftIcon={<Link />}
        addonRight={
          <Button variant="secondary" size="sm" className="rounded-none rounded-r-lg h-full">
            Copy
          </Button>
        }
      >
        <InputGroupInput defaultValue="https://worksite.app/p/abc123" readOnly />
      </InputGroup>
      <span className="text-xs text-muted-foreground">Anyone with this link can view the project</span>
    </div>
  ),
};

/**
 * Compact filters using small size for dense UIs.
 */
export const CompactFilters: Story = {
  name: 'Compact Filters',
  render: () => (
    <div className="flex items-center gap-2">
      <InputGroup inputSize="sm" leftIcon={<MagnifyingGlass />}>
        <InputGroupInput placeholder="Search..." className="w-40" />
      </InputGroup>
      <InputGroup inputSize="sm" prefix="$">
        <InputGroupInput placeholder="Min" type="number" className="w-20" />
      </InputGroup>
      <span className="text-muted-foreground">-</span>
      <InputGroup inputSize="sm" prefix="$">
        <InputGroupInput placeholder="Max" type="number" className="w-20" />
      </InputGroup>
    </div>
  ),
};
