import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  House,
  Folder,
  Gear,
  User,
  Bell,
  ChartBar,
  FileText,
  Package,
} from '@phosphor-icons/react';

import {
  SecondaryTabs,
  SecondaryTabsList,
  SecondaryTabsTrigger,
  SecondaryTabsContent,
} from '../components/ui/custom/secondary-tabs';

/**
 * SecondaryTabs component for secondary navigation within a page or section.
 *
 * ## Usage
 *
 * ```tsx
 * import {
 *   SecondaryTabs,
 *   SecondaryTabsList,
 *   SecondaryTabsTrigger,
 *   SecondaryTabsContent,
 * } from '@/components/ui/custom/secondary-tabs';
 *
 * <SecondaryTabs defaultValue="overview">
 *   <SecondaryTabsList>
 *     <SecondaryTabsTrigger value="overview">Overview</SecondaryTabsTrigger>
 *     <SecondaryTabsTrigger value="settings">Settings</SecondaryTabsTrigger>
 *   </SecondaryTabsList>
 *   <SecondaryTabsContent value="overview">Overview content</SecondaryTabsContent>
 *   <SecondaryTabsContent value="settings">Settings content</SecondaryTabsContent>
 * </SecondaryTabs>
 * ```
 *
 * ## Features
 *
 * - 44px trigger height with 16px horizontal padding
 * - 2px bottom border indicator on active tab
 * - Support for icons via Phosphor Icons
 * - Smooth color transitions on hover/active states
 * - Full keyboard navigation support
 * - Disabled state support
 */
const meta: Meta<typeof SecondaryTabs> = {
  title: 'UI/SecondaryTabs',
  component: SecondaryTabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// PLAYGROUND
// =============================================================================

/**
 * Interactive playground to test SecondaryTabs.
 * Click on different tabs to see the active state transition.
 */
export const Playground: Story = {
  render: () => (
    <SecondaryTabs defaultValue="tab1" className="w-full max-w-2xl">
      <SecondaryTabsList>
        <SecondaryTabsTrigger value="tab1">Overview</SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="tab2">Analytics</SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="tab3">Settings</SecondaryTabsTrigger>
      </SecondaryTabsList>
      <SecondaryTabsContent value="tab1">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Overview</h3>
          <p className="text-muted-foreground">
            This is the overview tab content. Click other tabs to navigate.
          </p>
        </div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="tab2">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Analytics</h3>
          <p className="text-muted-foreground">View your analytics and metrics here.</p>
        </div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="tab3">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Settings</h3>
          <p className="text-muted-foreground">Configure your preferences and settings.</p>
        </div>
      </SecondaryTabsContent>
    </SecondaryTabs>
  ),
};

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * Tabs with Phosphor icons for visual identification.
 * Icons automatically size to 18px and use the fill weight.
 */
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <SecondaryTabs defaultValue="home" className="w-full max-w-3xl">
      <SecondaryTabsList>
        <SecondaryTabsTrigger value="home" icon={House}>
          Home
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="projects" icon={Folder}>
          Projects
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="analytics" icon={ChartBar}>
          Analytics
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="settings" icon={Gear}>
          Settings
        </SecondaryTabsTrigger>
      </SecondaryTabsList>
      <SecondaryTabsContent value="home">
        <div className="rounded-lg border p-4">Home dashboard content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="projects">
        <div className="rounded-lg border p-4">Projects list content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="analytics">
        <div className="rounded-lg border p-4">Analytics charts content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="settings">
        <div className="rounded-lg border p-4">Settings form content</div>
      </SecondaryTabsContent>
    </SecondaryTabs>
  ),
};

// =============================================================================
// STATES
// =============================================================================

/**
 * Visual demonstration of all tab states:
 * - **Idle**: Default state with muted text
 * - **Hover**: Text color transitions to foreground
 * - **Active**: Foreground text with 2px bottom border
 * - **Focus**: Ring indicator for keyboard navigation
 * - **Disabled**: Reduced opacity, non-interactive
 */
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Active & Idle States</h4>
        <SecondaryTabs defaultValue="active" className="w-full max-w-xl">
          <SecondaryTabsList>
            <SecondaryTabsTrigger value="active">Active Tab</SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="idle1">Idle Tab</SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="idle2">Another Idle</SecondaryTabsTrigger>
          </SecondaryTabsList>
        </SecondaryTabs>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">With Disabled Tab</h4>
        <SecondaryTabs defaultValue="first" className="w-full max-w-xl">
          <SecondaryTabsList>
            <SecondaryTabsTrigger value="first">Enabled</SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="second" disabled>
              Disabled
            </SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="third">Also Enabled</SecondaryTabsTrigger>
          </SecondaryTabsList>
        </SecondaryTabs>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
          Focus State (Tab to see focus ring)
        </h4>
        <SecondaryTabs defaultValue="focus" className="w-full max-w-xl">
          <SecondaryTabsList>
            <SecondaryTabsTrigger value="focus">Focus Me</SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="other">Other Tab</SecondaryTabsTrigger>
          </SecondaryTabsList>
        </SecondaryTabs>
      </div>
    </div>
  ),
};

// =============================================================================
// MANY TABS
// =============================================================================

/**
 * Example with many tabs showing horizontal scrolling behavior.
 */
export const ManyTabs: Story = {
  name: 'Many Tabs',
  render: () => (
    <SecondaryTabs defaultValue="overview" className="w-full max-w-3xl">
      <SecondaryTabsList className="overflow-x-auto">
        <SecondaryTabsTrigger value="overview" icon={House}>
          Overview
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="projects" icon={Folder}>
          Projects
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="documents" icon={FileText}>
          Documents
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="analytics" icon={ChartBar}>
          Analytics
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="inventory" icon={Package}>
          Inventory
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="team" icon={User}>
          Team
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="notifications" icon={Bell}>
          Notifications
        </SecondaryTabsTrigger>
        <SecondaryTabsTrigger value="settings" icon={Gear}>
          Settings
        </SecondaryTabsTrigger>
      </SecondaryTabsList>
      <SecondaryTabsContent value="overview">
        <div className="rounded-lg border p-4">Overview content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="projects">
        <div className="rounded-lg border p-4">Projects content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="documents">
        <div className="rounded-lg border p-4">Documents content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="analytics">
        <div className="rounded-lg border p-4">Analytics content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="inventory">
        <div className="rounded-lg border p-4">Inventory content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="team">
        <div className="rounded-lg border p-4">Team content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="notifications">
        <div className="rounded-lg border p-4">Notifications content</div>
      </SecondaryTabsContent>
      <SecondaryTabsContent value="settings">
        <div className="rounded-lg border p-4">Settings content</div>
      </SecondaryTabsContent>
    </SecondaryTabs>
  ),
};

// =============================================================================
// CONTROLLED
// =============================================================================

/**
 * Controlled tabs with external state management.
 * Useful when you need to programmatically change the active tab.
 */
export const Controlled: Story = {
  name: 'Controlled',
  render: function ControlledExample() {
    const [activeTab, setActiveTab] = useState('tab1');

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tab1')}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Go to Tab 1
          </button>
          <button
            onClick={() => setActiveTab('tab2')}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Go to Tab 2
          </button>
          <button
            onClick={() => setActiveTab('tab3')}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Go to Tab 3
          </button>
        </div>

        <SecondaryTabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-xl">
          <SecondaryTabsList>
            <SecondaryTabsTrigger value="tab1">First</SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="tab2">Second</SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="tab3">Third</SecondaryTabsTrigger>
          </SecondaryTabsList>
          <SecondaryTabsContent value="tab1">
            <div className="rounded-lg border p-4">First tab content</div>
          </SecondaryTabsContent>
          <SecondaryTabsContent value="tab2">
            <div className="rounded-lg border p-4">Second tab content</div>
          </SecondaryTabsContent>
          <SecondaryTabsContent value="tab3">
            <div className="rounded-lg border p-4">Third tab content</div>
          </SecondaryTabsContent>
        </SecondaryTabs>

        <p className="text-sm text-muted-foreground">
          Current tab: <code className="font-mono">{activeTab}</code>
        </p>
      </div>
    );
  },
};

// =============================================================================
// USAGE: PROJECT DETAIL
// =============================================================================

/**
 * Real-world example: Project detail page navigation.
 */
export const ProjectDetailPage: Story = {
  name: 'Usage: Project Detail Page',
  render: () => (
    <div className="w-full max-w-4xl space-y-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Downtown Office Complex</h1>
        <p className="text-muted-foreground">Project #PRJ-2024-001</p>
      </div>

      <SecondaryTabs defaultValue="overview">
        <SecondaryTabsList>
          <SecondaryTabsTrigger value="overview" icon={House}>
            Overview
          </SecondaryTabsTrigger>
          <SecondaryTabsTrigger value="documents" icon={FileText}>
            Documents
          </SecondaryTabsTrigger>
          <SecondaryTabsTrigger value="team" icon={User}>
            Team
          </SecondaryTabsTrigger>
          <SecondaryTabsTrigger value="analytics" icon={ChartBar}>
            Analytics
          </SecondaryTabsTrigger>
          <SecondaryTabsTrigger value="settings" icon={Gear}>
            Settings
          </SecondaryTabsTrigger>
        </SecondaryTabsList>
        <SecondaryTabsContent value="overview">
          <div className="grid gap-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Budget</div>
                <div className="text-2xl font-bold">$2.4M</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-2xl font-bold">67%</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Days Left</div>
                <div className="text-2xl font-bold">45</div>
              </div>
            </div>
          </div>
        </SecondaryTabsContent>
        <SecondaryTabsContent value="documents">
          <div className="rounded-lg border p-4">Documents list here...</div>
        </SecondaryTabsContent>
        <SecondaryTabsContent value="team">
          <div className="rounded-lg border p-4">Team members here...</div>
        </SecondaryTabsContent>
        <SecondaryTabsContent value="analytics">
          <div className="rounded-lg border p-4">Analytics charts here...</div>
        </SecondaryTabsContent>
        <SecondaryTabsContent value="settings">
          <div className="rounded-lg border p-4">Settings form here...</div>
        </SecondaryTabsContent>
      </SecondaryTabs>
    </div>
  ),
};
