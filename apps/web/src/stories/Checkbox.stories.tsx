import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';

/**
 * Checkbox component with support for checked, unchecked, and indeterminate states.
 *
 * ## Usage
 *
 * ```tsx
 * import { Checkbox } from '@/components/ui/checkbox';
 * import { Label } from '@/components/ui/label';
 *
 * // Basic checkbox
 * <Checkbox id="terms" />
 *
 * // With label
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" />
 *   <Label htmlFor="terms">Accept terms</Label>
 * </div>
 *
 * // Indeterminate state (for "select all" scenarios)
 * <Checkbox checked="indeterminate" />
 *
 * // Controlled
 * const [checked, setChecked] = useState(false);
 * <Checkbox checked={checked} onCheckedChange={setChecked} />
 * ```
 *
 * ## Props
 *
 * - **checked**: `boolean | 'indeterminate'` - Controlled checked state
 * - **defaultChecked**: `boolean` - Default checked state (uncontrolled)
 * - **onCheckedChange**: `(checked: boolean | 'indeterminate') => void` - Change handler
 * - **disabled**: `boolean` - Disables the checkbox
 * - Plus all standard Radix Checkbox props
 *
 * ## States
 *
 * - **Unchecked**: Empty box with border
 * - **Checked**: Primary background with check icon
 * - **Indeterminate**: Primary background with minus icon
 * - **Hover**: Border darkens (unchecked) or background lightens (checked)
 * - **Focus**: Ring indicator for keyboard navigation
 * - **Disabled**: Reduced opacity, non-interactive
 */
const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'select',
      options: [true, false, 'indeterminate'],
      description: 'The controlled checked state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
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
 * Interactive playground to test all checkbox props.
 * Use the controls panel to experiment with different states.
 */
export const Playground: Story = {
  args: {
    checked: false,
    disabled: false,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="playground" {...args} />
      <Label htmlFor="playground">Checkbox label</Label>
    </div>
  ),
};

// =============================================================================
// STATES
// =============================================================================

/**
 * All checkbox states in one view.
 * - **Unchecked**: Default empty state
 * - **Checked**: With check icon
 * - **Indeterminate**: With minus icon (for partial selection)
 */
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-28 text-sm font-medium">Unchecked:</span>
        <div className="flex items-center gap-2">
          <Checkbox id="unchecked" />
          <Label htmlFor="unchecked">Label</Label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-28 text-sm font-medium">Checked:</span>
        <div className="flex items-center gap-2">
          <Checkbox id="checked" defaultChecked />
          <Label htmlFor="checked">Label</Label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-28 text-sm font-medium">Indeterminate:</span>
        <div className="flex items-center gap-2">
          <Checkbox id="indeterminate" checked="indeterminate" />
          <Label htmlFor="indeterminate">Label</Label>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// DISABLED STATES
// =============================================================================

/**
 * Disabled checkbox states.
 * Shows disabled appearance for all three states.
 */
export const DisabledStates: Story = {
  name: 'Disabled States',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-40 text-sm font-medium">Disabled Unchecked:</span>
        <div className="flex items-center gap-2">
          <Checkbox id="disabled-unchecked" disabled />
          <Label htmlFor="disabled-unchecked" className="text-muted-foreground">
            Label
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-40 text-sm font-medium">Disabled Checked:</span>
        <div className="flex items-center gap-2">
          <Checkbox id="disabled-checked" disabled defaultChecked />
          <Label htmlFor="disabled-checked" className="text-muted-foreground">
            Label
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-40 text-sm font-medium">Disabled Indeterminate:</span>
        <div className="flex items-center gap-2">
          <Checkbox id="disabled-indeterminate" disabled checked="indeterminate" />
          <Label htmlFor="disabled-indeterminate" className="text-muted-foreground">
            Label
          </Label>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// INTERACTIVE STATES
// =============================================================================

/**
 * Hover over checkboxes to see hover states.
 * Tab through to see focus states.
 */
export const InteractiveStates: Story = {
  name: 'Interactive States (Hover/Focus)',
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Hover over checkboxes to see hover states. Tab through to see focus rings.
      </p>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Checkbox id="hover-unchecked" />
          <Label htmlFor="hover-unchecked">Unchecked</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="hover-checked" defaultChecked />
          <Label htmlFor="hover-checked">Checked</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="hover-indeterminate" checked="indeterminate" />
          <Label htmlFor="hover-indeterminate">Indeterminate</Label>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// CONTROLLED
// =============================================================================

/**
 * Controlled checkbox with external state management.
 */
export const Controlled: Story = {
  name: 'Controlled',
  render: function ControlledExample() {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox id="controlled" checked={checked} onCheckedChange={setChecked} />
          <Label htmlFor="controlled">Controlled checkbox</Label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setChecked(false)}
            className="rounded bg-secondary px-3 py-1.5 text-sm"
          >
            Uncheck
          </button>
          <button
            onClick={() => setChecked(true)}
            className="rounded bg-secondary px-3 py-1.5 text-sm"
          >
            Check
          </button>
          <button
            onClick={() => setChecked('indeterminate')}
            className="rounded bg-secondary px-3 py-1.5 text-sm"
          >
            Indeterminate
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Current state: <code className="font-mono">{String(checked)}</code>
        </p>
      </div>
    );
  },
};

// =============================================================================
// WITHOUT LABEL
// =============================================================================

/**
 * Checkboxes without visible labels.
 * Use aria-label for accessibility when no visible label is present.
 */
export const WithoutLabel: Story = {
  name: 'Without Label (Standalone)',
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox aria-label="Select item 1" />
      <Checkbox aria-label="Select item 2" defaultChecked />
      <Checkbox aria-label="Select all" checked="indeterminate" />
    </div>
  ),
};

// =============================================================================
// USAGE: TERMS & CONDITIONS
// =============================================================================

/**
 * Common pattern: Terms acceptance checkbox.
 */
export const TermsAndConditions: Story = {
  name: 'Usage: Terms & Conditions',
  render: function TermsExample() {
    const [accepted, setAccepted] = useState(false);

    return (
      <div className="w-80 space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed">
            I agree to the{' '}
            <a href="#" className="text-primary underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        <button
          disabled={!accepted}
          className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    );
  },
};

// =============================================================================
// USAGE: SELECT ALL
// =============================================================================

/**
 * Common pattern: Select all with indeterminate state.
 */
export const SelectAll: Story = {
  name: 'Usage: Select All',
  render: function SelectAllExample() {
    const items = ['Email notifications', 'Push notifications', 'SMS alerts'];
    const [selected, setSelected] = useState<string[]>(['Email notifications']);

    const isAllSelected = selected.length === items.length;
    const isIndeterminate = selected.length > 0 && selected.length < items.length;

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
      if (checked === true) {
        setSelected([...items]);
      } else {
        setSelected([]);
      }
    };

    const handleItemChange = (item: string, checked: boolean | 'indeterminate') => {
      if (checked === true) {
        setSelected([...selected, item]);
      } else {
        setSelected(selected.filter((i) => i !== item));
      }
    };

    return (
      <div className="w-64 space-y-4 rounded-lg border p-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Checkbox
            id="select-all"
            checked={isIndeterminate ? 'indeterminate' : isAllSelected}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="font-medium">
            Select all
          </Label>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Checkbox
                id={item}
                checked={selected.includes(item)}
                onCheckedChange={(checked) => handleItemChange(item, checked)}
              />
              <Label htmlFor={item}>{item}</Label>
            </div>
          ))}
        </div>

        <p className="pt-2 text-sm text-muted-foreground">
          {selected.length} of {items.length} selected
        </p>
      </div>
    );
  },
};

// =============================================================================
// USAGE: FORM GROUP
// =============================================================================

/**
 * Common pattern: Checkbox group in a form.
 */
export const FormGroup: Story = {
  name: 'Usage: Form Group',
  render: () => (
    <fieldset className="w-72 space-y-4">
      <legend className="text-sm font-semibold">Project permissions</legend>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox id="view" defaultChecked />
          <Label htmlFor="view">Can view project</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="edit" defaultChecked />
          <Label htmlFor="edit">Can edit project</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="delete" />
          <Label htmlFor="delete">Can delete project</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="admin" disabled />
          <Label htmlFor="admin" className="text-muted-foreground">
            Admin access (requires approval)
          </Label>
        </div>
      </div>
    </fieldset>
  ),
};
