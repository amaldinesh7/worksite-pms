import type { Meta, StoryObj } from '@storybook/react-vite';

import { Typography, typographyVariants, type TypographyVariant } from '../components/ui/typography';

/**
 * Typography component for consistent text styling across the application.
 * Based on the Figma Design System - WorkSite PMS.
 *
 * ## Usage
 *
 * ```tsx
 * import { Typography } from '@/components/ui/typography';
 *
 * // Headings
 * <Typography variant="h1">Page Title</Typography>
 * <Typography variant="h2">Section Title</Typography>
 *
 * // Paragraph variants
 * <Typography variant="paragraph">Regular body text</Typography>
 * <Typography variant="paragraph-medium">Medium weight text</Typography>
 * <Typography variant="paragraph-small">Smaller text</Typography>
 *
 * // Polymorphic (render as different element)
 * <Typography variant="paragraph-mini" as="span">Badge text</Typography>
 *
 * // With additional styling
 * <Typography variant="muted" className="mt-2">Helper text</Typography>
 * ```
 *
 * ## Props
 *
 * - **variant**: Typography style to apply (h1, h2, paragraph, etc.)
 * - **as**: Override the default HTML element
 * - **className**: Additional CSS classes
 * - Plus all standard HTML element attributes
 *
 * ## Design Tokens
 *
 * | Variant | Size | Line Height | Weight | Font |
 * |---------|------|-------------|--------|------|
 * | h1 | 48px | 48px | 600 | Figtree |
 * | h2 | 30px | 30px | 600 | Figtree |
 * | h3 | 24px | 28.8px | 600 | Figtree |
 * | h4 | 20px | 24px | 600 | Figtree |
 * | paragraph | 16px | 24px | 400 | Figtree |
 * | paragraph-medium | 16px | 24px | 500 | Figtree |
 * | paragraph-bold | 16px | 24px | 600 | Figtree |
 * | paragraph-small | 14px | 20px | 400 | Figtree |
 * | paragraph-small-medium | 14px | 20px | 500 | Figtree |
 * | paragraph-mini | 12px | 16px | 400 | Figtree |
 * | paragraph-mini-medium | 12px | 16px | 500 | Figtree |
 * | paragraph-mini-bold | 12px | 16px | 600 | Figtree |
 * | monospace | 16px | 24px | 400 | Geist |
 */
const meta: Meta<typeof Typography> = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: typographyVariants,
      description: 'Typography variant from the design system',
      table: {
        defaultValue: { summary: 'paragraph' },
      },
    },
    as: {
      control: 'text',
      description: 'Override the default HTML element',
      table: {
        defaultValue: { summary: 'Based on variant' },
      },
    },
    children: {
      control: 'text',
      description: 'Text content to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// PLAYGROUND
// =============================================================================

/**
 * Interactive playground to test Typography component.
 * Use the controls panel to experiment with different variants.
 */
export const Playground: Story = {
  args: {
    variant: 'paragraph',
    children: 'The quick brown fox jumps over the lazy dog.',
  },
};

// =============================================================================
// HEADINGS
// =============================================================================

/**
 * Heading variants for page and section titles.
 * All headings use Figtree font with semibold (600) weight.
 *
 * - **h1**: 48px - Main page titles
 * - **h2**: 30px - Section titles
 * - **h3**: 24px - Subsection titles
 * - **h4**: 20px - Card/component titles
 */
export const Headings: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-end gap-4">
        <Typography variant="h1">heading 1</Typography>
        <span className="text-xs text-muted-foreground mb-2">48px / 600</span>
      </div>
      <div className="flex items-end gap-4">
        <Typography variant="h2">heading 2</Typography>
        <span className="text-xs text-muted-foreground mb-1">30px / 600</span>
      </div>
      <div className="flex items-end gap-4">
        <Typography variant="h3">heading 3</Typography>
        <span className="text-xs text-muted-foreground mb-0.5">24px / 600</span>
      </div>
      <div className="flex items-end gap-4">
        <Typography variant="h4">heading 4</Typography>
        <span className="text-xs text-muted-foreground">20px / 600</span>
      </div>
    </div>
  ),
};

// =============================================================================
// PARAGRAPH REGULAR
// =============================================================================

/**
 * Regular paragraph variants at 16px.
 * Use for main body content.
 *
 * - **paragraph**: Regular weight (400)
 * - **paragraph-medium**: Medium weight (500)
 * - **paragraph-bold**: Semibold weight (600)
 */
export const ParagraphRegular: Story = {
  name: 'Paragraph / Regular (16px)',
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <Typography variant="paragraph">paragraph regular</Typography>
        <span className="text-xs text-muted-foreground">16px / 400</span>
      </div>
      <div>
        <Typography variant="paragraph-medium">paragraph medium</Typography>
        <span className="text-xs text-muted-foreground">16px / 500</span>
      </div>
      <div>
        <Typography variant="paragraph-bold">paragraph bold</Typography>
        <span className="text-xs text-muted-foreground">16px / 600</span>
      </div>
    </div>
  ),
};

// =============================================================================
// PARAGRAPH SMALL
// =============================================================================

/**
 * Small paragraph variants at 14px.
 * Use for secondary content, descriptions, and labels.
 *
 * - **paragraph-small**: Regular weight (400)
 * - **paragraph-small-medium**: Medium weight (500)
 */
export const ParagraphSmall: Story = {
  name: 'Paragraph / Small (14px)',
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <Typography variant="paragraph-small">paragraph small</Typography>
        <span className="text-xs text-muted-foreground">14px / 400</span>
      </div>
      <div>
        <Typography variant="paragraph-small-medium">paragraph small medium</Typography>
        <span className="text-xs text-muted-foreground">14px / 500</span>
      </div>
    </div>
  ),
};

// =============================================================================
// PARAGRAPH MINI
// =============================================================================

/**
 * Mini paragraph variants at 12px.
 * Use for captions, badges, and metadata.
 *
 * - **paragraph-mini**: Regular weight (400)
 * - **paragraph-mini-medium**: Medium weight (500)
 * - **paragraph-mini-bold**: Semibold weight (600)
 */
export const ParagraphMini: Story = {
  name: 'Paragraph / Mini (12px)',
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <Typography variant="paragraph-mini">paragraph mini</Typography>
        <span className="text-xs text-muted-foreground">12px / 400</span>
      </div>
      <div>
        <Typography variant="paragraph-mini-medium">paragraph mini medium</Typography>
        <span className="text-xs text-muted-foreground">12px / 500</span>
      </div>
      <div>
        <Typography variant="paragraph-mini-bold">paragraph mini bold</Typography>
        <span className="text-xs text-muted-foreground">12px / 600</span>
      </div>
    </div>
  ),
};

// =============================================================================
// MONOSPACE
// =============================================================================

/**
 * Monospace variant using Geist font.
 * Use for code snippets, technical data, and IDs.
 */
export const Monospace: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <Typography variant="monospace">monospaced</Typography>
        <span className="text-xs text-muted-foreground">16px / 400 / Geist</span>
      </div>
      <div className="p-4 bg-muted rounded-md">
        <Typography variant="monospace">const projectId = &quot;proj_2024_001&quot;;</Typography>
      </div>
    </div>
  ),
};

// =============================================================================
// UTILITY VARIANTS
// =============================================================================

/**
 * Utility typography variants for specific use cases.
 *
 * - **lead**: Larger text for introductions (20px, muted)
 * - **muted**: Smaller secondary text (14px, muted)
 * - **blockquote**: Styled quotations with left border
 */
export const UtilityVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <Typography variant="lead">
          Lead text for introductions and summaries that need more emphasis.
        </Typography>
        <span className="text-xs text-muted-foreground block mt-1">lead - 20px / muted</span>
      </div>
      <div>
        <Typography variant="muted">
          Muted text for secondary information and helper text.
        </Typography>
        <span className="text-xs text-muted-foreground block mt-1">muted - 14px / muted</span>
      </div>
      <div>
        <Typography variant="blockquote">
          &quot;Quality is not an act, it is a habit.&quot; — Aristotle
        </Typography>
        <span className="text-xs text-muted-foreground block mt-1">blockquote - italic with border</span>
      </div>
    </div>
  ),
};

// =============================================================================
// ALL VARIANTS
// =============================================================================

/**
 * Complete overview of all typography variants in one view.
 * Matches the Figma design system typography scale.
 */
export const AllVariants: Story = {
  render: () => {
    const variants: { variant: TypographyVariant; label: string; specs: string }[] = [
      { variant: 'h1', label: 'heading 1', specs: '48px / 48px / -1.5px / 600' },
      { variant: 'h2', label: 'heading 2', specs: '30px / 30px / -1px / 600' },
      { variant: 'h3', label: 'heading 3', specs: '24px / 28.8px / -1px / 600' },
      { variant: 'h4', label: 'heading 4', specs: '20px / 24px / 0 / 600' },
      { variant: 'monospace', label: 'monospaced', specs: '16px / 24px / 0 / 400 / Geist' },
      { variant: 'paragraph', label: 'paragraph regular', specs: '16px / 24px / 0 / 400' },
      { variant: 'paragraph-medium', label: 'paragraph medium', specs: '16px / 24px / 0 / 500' },
      { variant: 'paragraph-bold', label: 'paragraph bold', specs: '16px / 24px / 0 / 600' },
      { variant: 'paragraph-small', label: 'paragraph small', specs: '14px / 20px / 0 / 400' },
      { variant: 'paragraph-small-medium', label: 'paragraph small medium', specs: '14px / 20px / 0 / 500' },
      { variant: 'paragraph-mini-bold', label: 'paragraph mini bold', specs: '12px / 16px / 0 / 600' },
      { variant: 'paragraph-mini-medium', label: 'paragraph mini medium', specs: '12px / 16px / 0 / 500' },
      { variant: 'paragraph-mini', label: 'paragraph mini', specs: '12px / 16px / 0 / 400' },
    ];

    return (
      <div className="flex flex-col gap-4 min-w-[400px]">
        {variants.map(({ variant, label, specs }) => (
          <div key={variant} className="flex items-baseline justify-between border-b pb-2">
            <Typography variant={variant}>{label}</Typography>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{specs}</span>
          </div>
        ))}
      </div>
    );
  },
};

// =============================================================================
// POLYMORPHIC USAGE
// =============================================================================

/**
 * Using the `as` prop to render different HTML elements.
 * Useful when semantic HTML requires a different element.
 */
export const PolymorphicUsage: Story = {
  name: 'Polymorphic (as prop)',
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <Typography variant="h2" as="h1">
          H2 style as h1 element
        </Typography>
        <span className="text-xs text-muted-foreground">
          variant=&quot;h2&quot; as=&quot;h1&quot;
        </span>
      </div>
      <div>
        <Typography variant="paragraph-small" as="span" className="bg-muted px-2 py-1 rounded">
          Paragraph as inline span
        </Typography>
        <span className="text-xs text-muted-foreground ml-2">
          variant=&quot;paragraph-small&quot; as=&quot;span&quot;
        </span>
      </div>
      <div>
        <Typography variant="paragraph-mini" as="label" className="cursor-pointer">
          Mini paragraph as label
        </Typography>
        <span className="text-xs text-muted-foreground ml-2">
          variant=&quot;paragraph-mini&quot; as=&quot;label&quot;
        </span>
      </div>
    </div>
  ),
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Real-world usage example: Page header with title and description.
 */
export const PageHeaderExample: Story = {
  name: 'Page Header',
  render: () => (
    <div className="flex flex-col gap-2 max-w-lg border-b pb-4">
      <Typography variant="h2">Projects</Typography>
      <Typography variant="muted">
        Manage your construction projects, track progress, and monitor budgets.
      </Typography>
    </div>
  ),
};

/**
 * Real-world usage example: Card with title, description, and metadata.
 */
export const CardContentExample: Story = {
  name: 'Card Content',
  render: () => (
    <div className="border rounded-lg p-4 max-w-sm">
      <Typography variant="h4">Metro Heights Tower</Typography>
      <Typography variant="paragraph-small" className="text-muted-foreground mt-1">
        32-story residential complex in downtown area
      </Typography>
      <div className="flex gap-4 mt-3">
        <div>
          <Typography variant="paragraph-mini" className="text-muted-foreground">
            Budget
          </Typography>
          <Typography variant="paragraph-medium">$2.4M</Typography>
        </div>
        <div>
          <Typography variant="paragraph-mini" className="text-muted-foreground">
            Progress
          </Typography>
          <Typography variant="paragraph-medium">67%</Typography>
        </div>
      </div>
    </div>
  ),
};

/**
 * Real-world usage example: Table cell content with different weights.
 */
export const TableCellExample: Story = {
  name: 'Table Cells',
  render: () => (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left">
              <Typography variant="paragraph-small-medium">Party Name</Typography>
            </th>
            <th className="px-4 py-2 text-left">
              <Typography variant="paragraph-small-medium">Type</Typography>
            </th>
            <th className="px-4 py-2 text-right">
              <Typography variant="paragraph-small-medium">Balance</Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-3">
              <Typography variant="paragraph-small">ABC Contractors</Typography>
            </td>
            <td className="px-4 py-3">
              <Typography variant="paragraph-mini" as="span" className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Vendor
              </Typography>
            </td>
            <td className="px-4 py-3 text-right">
              <Typography variant="paragraph-small-medium" className="text-green-600">
                +₹45,000
              </Typography>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
