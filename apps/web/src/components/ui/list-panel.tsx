/**
 * List Panel Component
 *
 * A reusable compound component for displaying a list of selectable items
 * in a card panel with header, scrollable content, loading, and empty states.
 *
 * Usage:
 * ```tsx
 * <ListPanel>
 *   <ListPanel.Header title="Projects" rightContent={<span>₹50,000</span>} />
 *   <ListPanel.Content>
 *     {isLoading ? (
 *       <ListPanel.Loading count={5} />
 *     ) : items.length === 0 ? (
 *       <ListPanel.Empty>No items found</ListPanel.Empty>
 *     ) : (
 *       items.map(item => (
 *         <ListPanel.Item
 *           key={item.id}
 *           isSelected={selected === item.id}
 *           onClick={() => setSelected(item.id)}
 *         >
 *           <span>{item.name}</span>
 *           <span>{item.amount}</span>
 *         </ListPanel.Item>
 *       ))
 *     )}
 *   </ListPanel.Content>
 * </ListPanel>
 * ```
 */

import { createContext, useContext, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { TypographyLarge, TypographyMuted } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

// ============================================
// Context
// ============================================

interface ListPanelContextValue {
  // Reserved for future shared state
}

const ListPanelContext = createContext<ListPanelContextValue | null>(null);

function useListPanelContext() {
  const context = useContext(ListPanelContext);
  if (!context) {
    throw new Error('ListPanel components must be used within a ListPanel');
  }
  return context;
}

// ============================================
// Root Component
// ============================================

interface ListPanelProps {
  children: ReactNode;
  className?: string;
}

function ListPanelRoot({ children, className }: ListPanelProps) {
  return (
    <ListPanelContext.Provider value={{}}>
      <Card
        className={cn(
          'bg-white border border-neutral-200 rounded-lg h-full flex flex-col',
          className
        )}
      >
        {children}
      </Card>
    </ListPanelContext.Provider>
  );
}

// ============================================
// Header Component
// ============================================

interface ListPanelHeaderProps {
  /** Title displayed on the left */
  title: string;
  /** Optional content displayed on the right (e.g., total amount) */
  rightContent?: ReactNode;
  className?: string;
}

function ListPanelHeader({ title, rightContent, className }: ListPanelHeaderProps) {
  useListPanelContext();
  return (
    <div className={cn('p-4 border-b border-neutral-200 shrink-0', className)}>
      <div className="flex items-center justify-between">
        <TypographyLarge className="text-base font-medium text-neutral-800">{title}</TypographyLarge>
        {rightContent && (
          <TypographyLarge className="text-base font-semibold text-neutral-900">{rightContent}</TypographyLarge>
        )}
      </div>
    </div>
  );
}

// ============================================
// Content Component (scrollable container)
// ============================================

interface ListPanelContentProps {
  children: ReactNode;
  className?: string;
}

function ListPanelContent({ children, className }: ListPanelContentProps) {
  useListPanelContext();
  return <div className={cn('flex-1 overflow-y-auto', className)}>{children}</div>;
}

// ============================================
// Item Component
// ============================================

interface ListPanelItemProps {
  children: ReactNode;
  /** Whether this item is currently selected */
  isSelected?: boolean;
  /** Click handler for selection */
  onClick?: () => void;
  className?: string;
}

function ListPanelItem({ children, isSelected = false, onClick, className }: ListPanelItemProps) {
  useListPanelContext();
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 cursor-pointer',
        'transition-colors duration-150',
        isSelected
          ? 'bg-primary/5'
          : 'hover:bg-neutral-50',
        className
      )}
    >
      {children}
    </button>
  );
}

// ============================================
// Loading Component
// ============================================

interface ListPanelLoadingProps {
  /** Number of skeleton items to show */
  count?: number;
  className?: string;
}

function ListPanelLoading({ count = 5, className }: ListPanelLoadingProps) {
  useListPanelContext();
  return (
    <div className={cn('py-1', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 px-4 border-b border-neutral-100 last:border-b-0">
          <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Empty Component
// ============================================

interface ListPanelEmptyProps {
  children: ReactNode;
  className?: string;
}

function ListPanelEmpty({ children, className }: ListPanelEmptyProps) {
  useListPanelContext();
  return (
    <div className={cn('p-4 text-center', className)}>
      <TypographyMuted>{children}</TypographyMuted>
    </div>
  );
}

// ============================================
// Compound Export
// ============================================

export const ListPanel = Object.assign(ListPanelRoot, {
  Header: ListPanelHeader,
  Content: ListPanelContent,
  Item: ListPanelItem,
  Loading: ListPanelLoading,
  Empty: ListPanelEmpty,
});

export type {
  ListPanelProps,
  ListPanelHeaderProps,
  ListPanelContentProps,
  ListPanelItemProps,
  ListPanelLoadingProps,
  ListPanelEmptyProps,
};
