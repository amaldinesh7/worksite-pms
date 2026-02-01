import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

/**
 * Switch component for toggling between on/off states.
 *
 * ## Usage
 *
 * ```tsx
 * import { Switch } from '@/components/ui/switch';
 * import { Label } from '@/components/ui/label';
 *
 * // Basic switch
 * <Switch id="airplane-mode" />
 *
 * // With label
 * <div className="flex items-center gap-2">
 *   <Switch id="airplane-mode" />
 *   <Label htmlFor="airplane-mode">Airplane Mode</Label>
 * </div>
 *
 * // Controlled
 * const [enabled, setEnabled] = useState(false);
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * ```
 *
 * ## Props
 *
 * - **checked**: `boolean` - Controlled checked state
 * - **defaultChecked**: `boolean` - Default checked state (uncontrolled)
 * - **onCheckedChange**: `(checked: boolean) => void` - Change handler
 * - **disabled**: `boolean` - Disables the switch
 * - Plus all standard Radix Switch props
 *
 * ## Design Specs
 *
 * - Track: 32×16px, fully rounded
 * - Thumb: 12×12px, white with subtle shadow
 * - Off state: Subtle border color background
 * - On state: Primary color background
 * - Transition: 150ms smooth animation
 */
const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The controlled checked state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
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
 * Interactive playground to test all switch props.
 * Use the controls panel to experiment with different states.
 */
export const Playground: Story = {
  args: {
    checked: false,
    disabled: false,
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Switch id="playground" {...args} />
      <Label htmlFor="playground">Toggle setting</Label>
    </div>
  ),
};

// =============================================================================
// STATES
// =============================================================================

/**
 * Switch states: off and on.
 * Click to toggle between states.
 */
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm font-medium">Off:</span>
        <div className="flex items-center gap-3">
          <Switch id="off" />
          <Label htmlFor="off">Label</Label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-20 text-sm font-medium">On:</span>
        <div className="flex items-center gap-3">
          <Switch id="on" defaultChecked />
          <Label htmlFor="on">Label</Label>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// DISABLED STATES
// =============================================================================

/**
 * Disabled switch states.
 * Shows disabled appearance for both on and off states.
 */
export const DisabledStates: Story = {
  name: 'Disabled States',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-28 text-sm font-medium">Disabled Off:</span>
        <div className="flex items-center gap-3">
          <Switch id="disabled-off" disabled />
          <Label htmlFor="disabled-off" className="text-muted-foreground">
            Label
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-28 text-sm font-medium">Disabled On:</span>
        <div className="flex items-center gap-3">
          <Switch id="disabled-on" disabled defaultChecked />
          <Label htmlFor="disabled-on" className="text-muted-foreground">
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
 * Hover over switches to see hover states.
 * Tab through to see focus states.
 */
export const InteractiveStates: Story = {
  name: 'Interactive States (Hover/Focus)',
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Hover over switches to see hover states. Tab through to see focus rings.
      </p>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <Switch id="hover-off" />
          <Label htmlFor="hover-off">Off (hover me)</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="hover-on" defaultChecked />
          <Label htmlFor="hover-on">On (hover me)</Label>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// CONTROLLED
// =============================================================================

/**
 * Controlled switch with external state management.
 */
export const Controlled: Story = {
  name: 'Controlled',
  render: function ControlledExample() {
    const [enabled, setEnabled] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch id="controlled" checked={enabled} onCheckedChange={setEnabled} />
          <Label htmlFor="controlled">Controlled switch</Label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEnabled(false)}
            className="rounded bg-secondary px-3 py-1.5 text-sm"
          >
            Turn Off
          </button>
          <button
            onClick={() => setEnabled(true)}
            className="rounded bg-secondary px-3 py-1.5 text-sm"
          >
            Turn On
          </button>
          <button
            onClick={() => setEnabled((prev) => !prev)}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Toggle
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Current state: <code className="font-mono">{enabled ? 'on' : 'off'}</code>
        </p>
      </div>
    );
  },
};

// =============================================================================
// WITHOUT LABEL
// =============================================================================

/**
 * Switches without visible labels.
 * Use aria-label for accessibility when no visible label is present.
 */
export const WithoutLabel: Story = {
  name: 'Without Label (Standalone)',
  render: () => (
    <div className="flex items-center gap-4">
      <Switch aria-label="Toggle feature 1" />
      <Switch aria-label="Toggle feature 2" defaultChecked />
    </div>
  ),
};

// =============================================================================
// LABEL PLACEMENT
// =============================================================================

/**
 * Different label placement options.
 */
export const LabelPlacement: Story = {
  name: 'Label Placement',
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <span className="mb-2 block text-sm font-medium text-muted-foreground">
          Label on right (default):
        </span>
        <div className="flex items-center gap-3">
          <Switch id="label-right" />
          <Label htmlFor="label-right">Enable notifications</Label>
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-muted-foreground">Label on left:</span>
        <div className="flex items-center gap-3">
          <Label htmlFor="label-left">Enable notifications</Label>
          <Switch id="label-left" />
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-muted-foreground">
          Justified (full width):
        </span>
        <div className="flex w-64 items-center justify-between">
          <Label htmlFor="justified">Enable notifications</Label>
          <Switch id="justified" />
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE: SETTINGS LIST
// =============================================================================

/**
 * Common pattern: Settings toggles list.
 */
export const SettingsList: Story = {
  name: 'Usage: Settings List',
  render: function SettingsExample() {
    const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      autoSave: true,
      analytics: false,
    });

    const updateSetting = (key: keyof typeof settings, value: boolean) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return (
      <div className="w-80 space-y-1 rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <Label htmlFor="notifications" className="font-medium">
              Notifications
            </Label>
            <p className="text-sm text-muted-foreground">Receive push notifications</p>
          </div>
          <Switch
            id="notifications"
            checked={settings.notifications}
            onCheckedChange={(checked) => updateSetting('notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between border-b p-4">
          <div>
            <Label htmlFor="darkMode" className="font-medium">
              Dark Mode
            </Label>
            <p className="text-sm text-muted-foreground">Use dark color theme</p>
          </div>
          <Switch
            id="darkMode"
            checked={settings.darkMode}
            onCheckedChange={(checked) => updateSetting('darkMode', checked)}
          />
        </div>

        <div className="flex items-center justify-between border-b p-4">
          <div>
            <Label htmlFor="autoSave" className="font-medium">
              Auto-save
            </Label>
            <p className="text-sm text-muted-foreground">Save changes automatically</p>
          </div>
          <Switch
            id="autoSave"
            checked={settings.autoSave}
            onCheckedChange={(checked) => updateSetting('autoSave', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4">
          <div>
            <Label htmlFor="analytics" className="font-medium">
              Analytics
            </Label>
            <p className="text-sm text-muted-foreground">Share usage data</p>
          </div>
          <Switch
            id="analytics"
            checked={settings.analytics}
            onCheckedChange={(checked) => updateSetting('analytics', checked)}
          />
        </div>
      </div>
    );
  },
};

// =============================================================================
// USAGE: FEATURE FLAG
// =============================================================================

/**
 * Common pattern: Feature flag toggle with status indicator.
 */
export const FeatureFlag: Story = {
  name: 'Usage: Feature Flag',
  render: function FeatureFlagExample() {
    const [enabled, setEnabled] = useState(false);

    return (
      <div className="w-80 rounded-lg border p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="beta-feature" className="font-medium">
                Beta Feature
              </Label>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enable experimental new dashboard design
            </p>
          </div>
          <Switch id="beta-feature" checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>
    );
  },
};

// =============================================================================
// USAGE: INLINE TOGGLE
// =============================================================================

/**
 * Common pattern: Inline toggle in a sentence.
 */
export const InlineToggle: Story = {
  name: 'Usage: Inline Toggle',
  render: function InlineToggleExample() {
    const [isPublic, setIsPublic] = useState(false);

    return (
      <div className="w-96 rounded-lg border p-4">
        <p className="flex items-center gap-2 text-sm">
          Make this project
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
            aria-label="Toggle public/private"
          />
          <span className={isPublic ? 'font-medium text-primary' : ''}>
            {isPublic ? 'public' : 'private'}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {isPublic
            ? 'Anyone with the link can view this project.'
            : 'Only team members can view this project.'}
        </p>
      </div>
    );
  },
};
