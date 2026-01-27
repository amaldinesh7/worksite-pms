import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  MagnifyingGlass,
  Envelope,
  Eye,
  EyeSlash,
  User,
  Lock,
  Calendar,
  Phone,
  Info,
  WarningCircle,
  Check,
} from '@phosphor-icons/react';
import { useState } from 'react';

import { Input } from '../components/ui/input';

/**
 * Input component with size and state variants.
 *
 * ## Usage
 *
 * ```tsx
 * import { Input } from '@/components/ui/input';
 *
 * // Basic input
 * <Input placeholder="Enter value..." />
 *
 * // With icons
 * <Input leftIcon={<MagnifyingGlass />} placeholder="Search..." />
 *
 * // Error state
 * <Input isError placeholder="Invalid input" />
 *
 * // Different sizes
 * <Input inputSize="lg" placeholder="Large input" />
 * <Input inputSize="sm" placeholder="Small input" />
 * <Input inputSize="mini" placeholder="Mini input" />
 * ```
 *
 * ## Props
 *
 * - **inputSize**: `default` (36px) | `lg` (40px) | `sm` (32px) | `mini` (24px)
 * - **isError**: Shows red border and focus ring for error state
 * - **leftIcon**: Icon element to display on the left
 * - **rightIcon**: Icon element to display on the right
 * - Plus all standard input HTML attributes
 */
const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
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
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'search'],
      description: 'Input type',
      table: {
        defaultValue: { summary: 'text' },
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
 * Interactive playground to test all input props.
 * Use the controls panel to experiment with different configurations.
 */
export const Playground: Story = {
  args: {
    placeholder: 'Enter value...',
    inputSize: 'default',
    isError: false,
    disabled: false,
    type: 'text',
  },
  render: (args) => (
    <div className="w-80">
      <Input {...args} />
    </div>
  ),
};

// =============================================================================
// SIZES
// =============================================================================

/**
 * Input sizes from largest to smallest.
 * Each size has appropriate padding, font size, and border radius.
 */
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Input inputSize="lg" placeholder="Large (40px)" />
        <span className="text-xs text-muted-foreground">Large - 40px height, 16px padding</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input inputSize="default" placeholder="Default (36px)" />
        <span className="text-xs text-muted-foreground">Default - 36px height, 12px padding</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input inputSize="sm" placeholder="Small (32px)" />
        <span className="text-xs text-muted-foreground">Small - 32px height, 8px padding</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input inputSize="mini" placeholder="Mini (24px)" />
        <span className="text-xs text-muted-foreground">
          Mini - 24px height, 6px padding, smaller radius
        </span>
      </div>
    </div>
  ),
};

// =============================================================================
// STATES
// =============================================================================

/**
 * All input states: empty, with value, error, and disabled.
 * Click on the error input to see the error focus ring.
 */
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Input placeholder="Empty state" />
        <span className="text-xs text-muted-foreground">Empty - shows placeholder</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input defaultValue="With value" />
        <span className="text-xs text-muted-foreground">With Value - shows entered text</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input isError placeholder="Error state" />
        <span className="text-xs text-red-500">
          Error - red border (click to see red focus ring)
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <Input disabled placeholder="Disabled state" />
        <span className="text-xs text-muted-foreground">
          Disabled - 50% opacity, not interactive
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <Input disabled defaultValue="Disabled with value" />
        <span className="text-xs text-muted-foreground">Disabled with Value</span>
      </div>
    </div>
  ),
};

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * Inputs with left icon, right icon, or both.
 * Icons automatically scale based on input size.
 */
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Left Icon</span>
        <Input leftIcon={<MagnifyingGlass />} placeholder="Search..." />
        <Input leftIcon={<Envelope />} placeholder="Email address" type="email" />
        <Input leftIcon={<User />} placeholder="Username" />
        <Input leftIcon={<Lock />} placeholder="Password" type="password" />
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Right Icon</span>
        <Input rightIcon={<Info />} placeholder="With info icon" />
        <Input rightIcon={<Calendar />} placeholder="Select date" />
        <Input rightIcon={<Check className="text-green-500" />} defaultValue="Valid input" />
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Both Icons</span>
        <Input
          leftIcon={<Envelope />}
          rightIcon={<Check className="text-green-500" />}
          defaultValue="valid@email.com"
        />
        <Input leftIcon={<Phone />} rightIcon={<Info />} placeholder="Phone number" />
      </div>
    </div>
  ),
};

/**
 * Icons scale appropriately with input size.
 * Large/Default use 20px icons, Small uses 16px, Mini uses 14px.
 */
export const IconSizes: Story = {
  name: 'Icon Sizes',
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Input inputSize="lg" leftIcon={<MagnifyingGlass />} placeholder="Large - 20px icon" />
      <Input inputSize="default" leftIcon={<MagnifyingGlass />} placeholder="Default - 20px icon" />
      <Input inputSize="sm" leftIcon={<MagnifyingGlass />} placeholder="Small - 16px icon" />
      <Input inputSize="mini" leftIcon={<MagnifyingGlass />} placeholder="Mini - 14px icon" />
    </div>
  ),
};

// =============================================================================
// ERROR STATES
// =============================================================================

/**
 * Error state styling with validation messages.
 * Focus on error inputs to see the red focus ring (#fca5a5).
 */
export const ErrorStates: Story = {
  name: 'Error States',
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Input isError placeholder="Error - empty" />
        <span className="text-xs text-red-500">This field is required</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input isError defaultValue="invalid-email" />
        <span className="text-xs text-red-500">Please enter a valid email</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input
          isError
          leftIcon={<Envelope />}
          rightIcon={<WarningCircle className="text-red-500" />}
          defaultValue="bad@"
        />
        <span className="text-xs text-red-500">Invalid email format</span>
      </div>
    </div>
  ),
};

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Common HTML input types supported by the component.
 */
export const InputTypes: Story = {
  name: 'Input Types',
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Input type="text" placeholder="Text input" />
        <span className="text-xs text-muted-foreground">type="text"</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input type="email" placeholder="Email input" />
        <span className="text-xs text-muted-foreground">type="email"</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input type="password" placeholder="Password input" />
        <span className="text-xs text-muted-foreground">type="password"</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input type="number" placeholder="Number input" />
        <span className="text-xs text-muted-foreground">type="number"</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input type="tel" placeholder="Phone input" />
        <span className="text-xs text-muted-foreground">type="tel"</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input type="search" placeholder="Search input" />
        <span className="text-xs text-muted-foreground">type="search"</span>
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Password input with visibility toggle.
 * Interactive example showing how to combine Input with custom functionality.
 */
export const PasswordToggle: Story = {
  name: 'Password with Toggle',
  render: function PasswordToggleExample() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="w-80 flex flex-col gap-2">
        <label className="text-sm font-medium">Password</label>
        <Input
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeSlash /> : <Eye />}
            </button>
          }
          placeholder="Enter password"
        />
        <span className="text-xs text-muted-foreground">
          Click the eye icon to toggle visibility
        </span>
      </div>
    );
  },
};

/**
 * Login form pattern showing typical form layout with labels.
 */
export const LoginForm: Story = {
  name: 'Login Form',
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" leftIcon={<Envelope />} placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Password</label>
        <Input type="password" leftIcon={<Lock />} placeholder="••••••••" />
      </div>
    </div>
  ),
};

/**
 * Search input pattern - common search bar styling.
 */
export const SearchInput: Story = {
  name: 'Search Input',
  render: () => (
    <div className="w-96">
      <Input
        leftIcon={<MagnifyingGlass />}
        placeholder="Search projects, tasks, or team members..."
      />
    </div>
  ),
};

/**
 * Form validation pattern showing success and error states together.
 */
export const FormValidation: Story = {
  name: 'Form Validation',
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          leftIcon={<Envelope />}
          rightIcon={<Check className="text-green-500" />}
          defaultValue="valid@example.com"
        />
        <span className="text-xs text-green-500">Email is available</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Username</label>
        <Input
          isError
          leftIcon={<User />}
          rightIcon={<WarningCircle className="text-red-500" />}
          defaultValue="admin"
        />
        <span className="text-xs text-red-500">Username is already taken</span>
      </div>
    </div>
  ),
};

/**
 * Compact filter inputs pattern - using small size for dense UIs.
 */
export const CompactFilters: Story = {
  name: 'Compact Filters',
  render: () => (
    <div className="flex items-center gap-2">
      <Input
        inputSize="sm"
        leftIcon={<MagnifyingGlass />}
        placeholder="Search..."
        className="w-48"
      />
      <Input inputSize="sm" leftIcon={<Calendar />} placeholder="Date" className="w-32" />
      <Input inputSize="sm" leftIcon={<User />} placeholder="Assignee" className="w-32" />
    </div>
  ),
};
