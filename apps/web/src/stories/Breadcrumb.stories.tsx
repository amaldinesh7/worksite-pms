import type { Meta, StoryObj } from '@storybook/react-vite';
import { House, Folder, FileText, Gear } from '@phosphor-icons/react';
import { MemoryRouter } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  type BreadcrumbItem as BreadcrumbItemType,
} from '../components/ui/breadcrumb';

/**
 * Breadcrumb component for showing hierarchical navigation with automatic truncation support.
 *
 * ## Usage
 *
 * ```tsx
 * import { Breadcrumb } from '@/components/ui/breadcrumb';
 *
 * // Simple breadcrumb
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Projects', href: '/projects' },
 *     { label: 'Current Project' },
 *   ]}
 * />
 *
 * // With truncation (auto-collapses middle items)
 * <Breadcrumb
 *   items={manyItems}
 *   maxItems={4}
 *   itemsBeforeCollapse={1}
 *   itemsAfterCollapse={2}
 * />
 *
 * // With icons
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/', icon: <House size={14} /> },
 *     { label: 'Settings' },
 *   ]}
 * />
 * ```
 *
 * ## Props
 *
 * - **items**: `BreadcrumbItem[]` - Array of breadcrumb items
 * - **maxItems**: `number` - Maximum items before collapsing (default: 4)
 * - **itemsBeforeCollapse**: `number` - Items to show at start when collapsed (default: 1)
 * - **itemsAfterCollapse**: `number` - Items to show at end when collapsed (default: 2)
 * - **separator**: `ReactNode` - Custom separator element
 *
 * ## Features
 *
 * - Automatic truncation with dropdown for collapsed items
 * - Accessible navigation with proper ARIA attributes
 * - Hover underline effect on links
 * - Focus ring for keyboard navigation
 * - Support for custom icons
 * - Custom separator support
 */
const meta: Meta<typeof Breadcrumb> = {
  title: 'UI/Breadcrumb',
  component: Breadcrumb,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    maxItems: {
      control: { type: 'number', min: 2, max: 10 },
      description: 'Maximum number of items before collapsing',
      table: {
        defaultValue: { summary: '4' },
      },
    },
    itemsBeforeCollapse: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Number of items to show at start when collapsed',
      table: {
        defaultValue: { summary: '1' },
      },
    },
    itemsAfterCollapse: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Number of items to show at end when collapsed',
      table: {
        defaultValue: { summary: '2' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// SAMPLE DATA
// =============================================================================

const simpleItems: BreadcrumbItemType[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Downtown Office Complex' },
];

const longItems: BreadcrumbItemType[] = [
  { label: 'Home', href: '/' },
  { label: 'Organization', href: '/org' },
  { label: 'Projects', href: '/projects' },
  { label: 'Active', href: '/projects/active' },
  { label: 'Commercial', href: '/projects/active/commercial' },
  { label: 'Downtown Office Complex' },
];

const itemsWithIcons: BreadcrumbItemType[] = [
  { label: 'Home', href: '/', icon: <House size={14} weight="fill" /> },
  { label: 'Projects', href: '/projects', icon: <Folder size={14} weight="fill" /> },
  { label: 'Documents', href: '/projects/docs', icon: <FileText size={14} weight="fill" /> },
  { label: 'Contract.pdf' },
];

// =============================================================================
// PLAYGROUND
// =============================================================================

/**
 * Interactive playground to test breadcrumb props.
 * Use the controls panel to experiment with truncation settings.
 */
export const Playground: Story = {
  args: {
    items: longItems,
    maxItems: 4,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 2,
  },
};

// =============================================================================
// BASIC
// =============================================================================

/**
 * Simple breadcrumb without truncation.
 * Shows typical navigation hierarchy.
 */
export const Basic: Story = {
  name: 'Basic',
  args: {
    items: simpleItems,
  },
};

// =============================================================================
// WITH TRUNCATION
// =============================================================================

/**
 * Breadcrumb with automatic truncation.
 * Middle items are collapsed into a dropdown menu.
 * Click the ellipsis to see hidden items.
 */
export const WithTruncation: Story = {
  name: 'With Truncation',
  args: {
    items: longItems,
    maxItems: 4,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 2,
  },
};

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * Breadcrumb items with icons.
 * Icons help users quickly identify item types.
 */
export const WithIcons: Story = {
  name: 'With Icons',
  args: {
    items: itemsWithIcons,
  },
};

// =============================================================================
// TRUNCATION SETTINGS
// =============================================================================

/**
 * Different truncation configurations.
 * Shows how maxItems, itemsBeforeCollapse, and itemsAfterCollapse affect display.
 */
export const TruncationSettings: Story = {
  name: 'Truncation Settings',
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
          Default (maxItems: 4, before: 1, after: 2)
        </h4>
        <Breadcrumb items={longItems} maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2} />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
          Show more at start (maxItems: 4, before: 2, after: 1)
        </h4>
        <Breadcrumb items={longItems} maxItems={4} itemsBeforeCollapse={2} itemsAfterCollapse={1} />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
          Minimal (maxItems: 3, before: 1, after: 1)
        </h4>
        <Breadcrumb items={longItems} maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1} />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
          No truncation (maxItems: 10)
        </h4>
        <Breadcrumb items={longItems} maxItems={10} />
      </div>
    </div>
  ),
};

// =============================================================================
// STATES
// =============================================================================

/**
 * Breadcrumb link states.
 * Hover over links to see underline effect.
 * Tab through to see focus states.
 */
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Hover over links to see underline effect. Tab through to see focus rings.
      </p>
      <Breadcrumb items={simpleItems} />
    </div>
  ),
};

// =============================================================================
// COMPOSABLE API
// =============================================================================

/**
 * Using the composable sub-components for full control.
 * Useful when you need custom rendering or behavior.
 */
export const ComposableAPI: Story = {
  name: 'Composable API',
  render: () => (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink to="/">
            <House size={14} weight="fill" className="mr-1" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink to="/projects">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current Project</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  ),
};

// =============================================================================
// CUSTOM SEPARATOR
// =============================================================================

/**
 * Breadcrumb with custom separator.
 * You can use any React node as a separator.
 */
export const CustomSeparator: Story = {
  name: 'Custom Separator',
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Slash separator</h4>
        <Breadcrumb
          items={simpleItems}
          separator={<span className="text-muted-foreground">/</span>}
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Arrow separator</h4>
        <Breadcrumb
          items={simpleItems}
          separator={<span className="text-muted-foreground">→</span>}
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Dot separator</h4>
        <Breadcrumb
          items={simpleItems}
          separator={<span className="text-muted-foreground">•</span>}
        />
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE: PAGE HEADER
// =============================================================================

/**
 * Common pattern: Breadcrumb in a page header.
 */
export const PageHeader: Story = {
  name: 'Usage: Page Header',
  render: () => (
    <div className="w-full max-w-4xl">
      <Breadcrumb
        items={[{ label: 'Projects', href: '/projects' }, { label: 'Downtown Office Complex' }]}
        className="mb-2"
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Downtown Office Complex</h1>
        <button className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Edit Project
        </button>
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE: DOCUMENT PATH
// =============================================================================

/**
 * Common pattern: Document/file path breadcrumb.
 */
export const DocumentPath: Story = {
  name: 'Usage: Document Path',
  render: () => (
    <div className="w-full max-w-3xl rounded-lg border p-4">
      <Breadcrumb
        items={[
          { label: 'Documents', href: '/documents', icon: <Folder size={14} weight="fill" /> },
          {
            label: 'Contracts',
            href: '/documents/contracts',
            icon: <Folder size={14} weight="fill" />,
          },
          {
            label: '2024',
            href: '/documents/contracts/2024',
            icon: <Folder size={14} weight="fill" />,
          },
          { label: 'vendor-agreement.pdf', icon: <FileText size={14} weight="fill" /> },
        ]}
      />
      <div className="mt-4 flex h-48 items-center justify-center rounded bg-muted">
        <span className="text-muted-foreground">Document preview area</span>
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE: SETTINGS NAVIGATION
// =============================================================================

/**
 * Common pattern: Settings page navigation.
 */
export const SettingsNavigation: Story = {
  name: 'Usage: Settings Navigation',
  render: () => (
    <div className="w-full max-w-2xl">
      <Breadcrumb
        items={[
          { label: 'Settings', href: '/settings', icon: <Gear size={14} weight="fill" /> },
          { label: 'Organization', href: '/settings/org' },
          { label: 'Team Members' },
        ]}
        className="mb-4"
      />
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage your organization's team members and their roles.
          </p>
        </div>
        <div className="p-4">
          <div className="flex h-32 items-center justify-center rounded bg-muted">
            <span className="text-muted-foreground">Team members list</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE: LONG PATH (DEEP NESTING)
// =============================================================================

/**
 * Example with deeply nested path showing truncation in action.
 */
export const DeepNesting: Story = {
  name: 'Usage: Deep Nesting',
  render: () => {
    const deepItems: BreadcrumbItemType[] = [
      { label: 'Organization', href: '/org' },
      { label: 'Workspaces', href: '/org/workspaces' },
      { label: 'Engineering', href: '/org/workspaces/engineering' },
      { label: 'Projects', href: '/org/workspaces/engineering/projects' },
      { label: 'Frontend', href: '/org/workspaces/engineering/projects/frontend' },
      { label: 'Components', href: '/org/workspaces/engineering/projects/frontend/components' },
      { label: 'Button.tsx' },
    ];

    return (
      <div className="w-full max-w-3xl space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the ellipsis (...) to see the collapsed items in a dropdown menu.
        </p>
        <div className="rounded-lg border p-4">
          <Breadcrumb
            items={deepItems}
            maxItems={4}
            itemsBeforeCollapse={1}
            itemsAfterCollapse={2}
          />
        </div>
      </div>
    );
  },
};
