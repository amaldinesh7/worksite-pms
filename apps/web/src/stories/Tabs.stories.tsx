import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  House,
  Gear,
  User,
  Bell,
  Folder,
  EnvelopeSimple,
  ChartBar,
  Clock,
} from '@phosphor-icons/react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

/**
 * Segmented tabs component with variants, sizes, and icon/counter support.
 *
 * ## Usage
 *
 * ```tsx
 * import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
 *
 * // Basic tabs
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 *
 * // With size variants
 * <TabsList size="lg">
 *   <TabsTrigger size="lg" value="tab1">Large Tab</TabsTrigger>
 * </TabsList>
 *
 * // With icons and counters
 * <TabsTrigger value="inbox" icon={<EnvelopeSimple />} counter={5}>
 *   Inbox
 * </TabsTrigger>
 * ```
 *
 * ## Props
 *
 * ### TabsList
 * - **size**: `sm` | `default` | `lg` - Size variant affecting border radius
 *
 * ### TabsTrigger
 * - **size**: `sm` | `default` | `lg` - Size variant affecting height, padding, and font
 * - **icon**: Optional leading icon element
 * - **counter**: Optional numeric badge value
 */
const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// PLAYGROUND
// =============================================================================

/**
 * Interactive playground to test tabs with all available props.
 * Use the controls panel to experiment with different configurations.
 */
export const Playground: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Overview content goes here. This is the default active tab.
        </p>
      </TabsContent>
      <TabsContent value="analytics" className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Analytics and metrics would be displayed here.
        </p>
      </TabsContent>
      <TabsContent value="settings" className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Configuration options and settings would appear here.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

// =============================================================================
// SIZES
// =============================================================================

/**
 * Tab sizes from smallest to largest.
 * Each size has appropriate height, padding, and font size.
 *
 * | Size | Height | Font |
 * |------|--------|------|
 * | sm | 20px | text-xs |
 * | default | 32px | text-sm |
 * | lg | 32px | text-sm (more padding) |
 */
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Small (sm)</span>
        <Tabs defaultValue="tab1">
          <TabsList size="sm">
            <TabsTrigger size="sm" value="tab1">
              Overview
            </TabsTrigger>
            <TabsTrigger size="sm" value="tab2">
              Analytics
            </TabsTrigger>
            <TabsTrigger size="sm" value="tab3">
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Default</span>
        <Tabs defaultValue="tab1">
          <TabsList size="default">
            <TabsTrigger size="default" value="tab1">
              Overview
            </TabsTrigger>
            <TabsTrigger size="default" value="tab2">
              Analytics
            </TabsTrigger>
            <TabsTrigger size="default" value="tab3">
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Large (lg)</span>
        <Tabs defaultValue="tab1">
          <TabsList size="lg">
            <TabsTrigger size="lg" value="tab1">
              Overview
            </TabsTrigger>
            <TabsTrigger size="lg" value="tab2">
              Analytics
            </TabsTrigger>
            <TabsTrigger size="lg" value="tab3">
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * Tabs with leading icons for better visual recognition.
 * Icons help users quickly identify tab content at a glance.
 */
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Icon + Label</span>
        <Tabs defaultValue="home">
          <TabsList>
            <TabsTrigger value="home" icon={<House weight="bold" />}>
              Home
            </TabsTrigger>
            <TabsTrigger value="profile" icon={<User weight="bold" />}>
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" icon={<Gear weight="bold" />}>
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Icon Only</span>
        <Tabs defaultValue="home">
          <TabsList>
            <TabsTrigger value="home" icon={<House weight="bold" />} aria-label="Home" />
            <TabsTrigger value="profile" icon={<User weight="bold" />} aria-label="Profile" />
            <TabsTrigger value="settings" icon={<Gear weight="bold" />} aria-label="Settings" />
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};

/**
 * Different icon sizes matching the tab sizes.
 */
export const IconSizes: Story = {
  name: 'Icon Sizes',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Small</span>
        <Tabs defaultValue="home">
          <TabsList size="sm">
            <TabsTrigger size="sm" value="home" icon={<House weight="bold" />}>
              Home
            </TabsTrigger>
            <TabsTrigger size="sm" value="profile" icon={<User weight="bold" />}>
              Profile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Default</span>
        <Tabs defaultValue="home">
          <TabsList>
            <TabsTrigger value="home" icon={<House weight="bold" />}>
              Home
            </TabsTrigger>
            <TabsTrigger value="profile" icon={<User weight="bold" />}>
              Profile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Large</span>
        <Tabs defaultValue="home">
          <TabsList size="lg">
            <TabsTrigger size="lg" value="home" icon={<House weight="bold" />}>
              Home
            </TabsTrigger>
            <TabsTrigger size="lg" value="profile" icon={<User weight="bold" />}>
              Profile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};

// =============================================================================
// WITH COUNTERS
// =============================================================================

/**
 * Tabs with numeric counter badges.
 * Useful for showing notification counts, item totals, or status indicators.
 */
export const WithCounters: Story = {
  name: 'With Counters',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Label + Counter</span>
        <Tabs defaultValue="inbox">
          <TabsList>
            <TabsTrigger value="inbox" counter={12}>
              Inbox
            </TabsTrigger>
            <TabsTrigger value="drafts" counter={3}>
              Drafts
            </TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Icon + Label + Counter</span>
        <Tabs defaultValue="inbox">
          <TabsList>
            <TabsTrigger value="inbox" icon={<EnvelopeSimple weight="bold" />} counter={12}>
              Inbox
            </TabsTrigger>
            <TabsTrigger value="notifications" icon={<Bell weight="bold" />} counter={5}>
              Notifications
            </TabsTrigger>
            <TabsTrigger value="tasks" icon={<Clock weight="bold" />} counter={0}>
              Tasks
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};

/**
 * Counter badges with different sizes.
 */
export const CounterSizes: Story = {
  name: 'Counter Sizes',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Small</span>
        <Tabs defaultValue="inbox">
          <TabsList size="sm">
            <TabsTrigger size="sm" value="inbox" counter={12}>
              Inbox
            </TabsTrigger>
            <TabsTrigger size="sm" value="drafts" counter={3}>
              Drafts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Default</span>
        <Tabs defaultValue="inbox">
          <TabsList>
            <TabsTrigger value="inbox" counter={12}>
              Inbox
            </TabsTrigger>
            <TabsTrigger value="drafts" counter={3}>
              Drafts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Large</span>
        <Tabs defaultValue="inbox">
          <TabsList size="lg">
            <TabsTrigger size="lg" value="inbox" counter={12}>
              Inbox
            </TabsTrigger>
            <TabsTrigger size="lg" value="drafts" counter={3}>
              Drafts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};

// =============================================================================
// STATES
// =============================================================================

/**
 * Tab states: active, inactive, hover, and disabled.
 * - **Active**: White background with shadow
 * - **Inactive**: Transparent, shows hover state on mouseover
 * - **Disabled**: Reduced opacity, no interaction
 */
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Active / Inactive</span>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Tab</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Tab</TabsTrigger>
            <TabsTrigger value="another">Another Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">With Disabled Tab</span>
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Enabled</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Disabled
            </TabsTrigger>
            <TabsTrigger value="tab3">Enabled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Disabled with Icon</span>
        <Tabs defaultValue="home">
          <TabsList>
            <TabsTrigger value="home" icon={<House weight="bold" />}>
              Home
            </TabsTrigger>
            <TabsTrigger value="settings" icon={<Gear weight="bold" />} disabled>
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Project dashboard tabs showing different views.
 * Common pattern for navigation within a feature area.
 */
export const ProjectDashboard: Story = {
  name: 'Project Dashboard',
  render: () => (
    <div className="w-[500px]">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" icon={<ChartBar weight="bold" />}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="files" icon={<Folder weight="bold" />} counter={24}>
            Files
          </TabsTrigger>
          <TabsTrigger value="activity" icon={<Clock weight="bold" />}>
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" icon={<Gear weight="bold" />}>
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Project Overview</h3>
          <p className="text-sm text-muted-foreground">
            View key metrics, progress, and status updates for your project.
          </p>
        </TabsContent>
        <TabsContent value="files" className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Project Files</h3>
          <p className="text-sm text-muted-foreground">
            Browse and manage all files associated with this project.
          </p>
        </TabsContent>
        <TabsContent value="activity" className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Track all changes and updates made to this project.
          </p>
        </TabsContent>
        <TabsContent value="settings" className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Project Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure project preferences, permissions, and integrations.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/**
 * Inbox navigation with unread counts.
 * Shows how counters can indicate pending items.
 */
export const InboxNavigation: Story = {
  name: 'Inbox Navigation',
  render: () => (
    <div className="w-[400px]">
      <Tabs defaultValue="inbox">
        <TabsList size="lg">
          <TabsTrigger size="lg" value="inbox" icon={<EnvelopeSimple weight="bold" />} counter={12}>
            Inbox
          </TabsTrigger>
          <TabsTrigger size="lg" value="notifications" icon={<Bell weight="bold" />} counter={3}>
            Notifications
          </TabsTrigger>
          <TabsTrigger size="lg" value="archive" icon={<Folder weight="bold" />}>
            Archive
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inbox" className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">You have 12 unread messages.</p>
        </TabsContent>
        <TabsContent value="notifications" className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">3 new notifications.</p>
        </TabsContent>
        <TabsContent value="archive" className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Archived items appear here.</p>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/**
 * Compact filter tabs for data views.
 * Small size works well in dense interfaces.
 */
export const CompactFilters: Story = {
  name: 'Compact Filters',
  render: () => (
    <div className="w-[300px]">
      <Tabs defaultValue="all">
        <TabsList size="sm">
          <TabsTrigger size="sm" value="all">
            All
          </TabsTrigger>
          <TabsTrigger size="sm" value="active" counter={8}>
            Active
          </TabsTrigger>
          <TabsTrigger size="sm" value="completed" counter={15}>
            Completed
          </TabsTrigger>
          <TabsTrigger size="sm" value="archived">
            Archived
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  ),
};
