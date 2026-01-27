import type { ReactNode } from 'react';
import { List, Bell, CaretRight } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Typography } from '../ui/typography';

// Re-export for convenience
export type { BreadcrumbItem };

interface HeaderProps {
  /** Page title displayed in the header (for single pages) */
  title?: string;
  /** Breadcrumb items (for nested pages) - takes precedence over title */
  breadcrumbs?: BreadcrumbItem[];
  /** Custom action buttons on the right */
  actions?: ReactNode;
  /** Additional className */
  className?: string;
}

export function Header({ title, breadcrumbs, actions, className }: HeaderProps) {
  const { openMobile } = useSidebarStore();

  // Determine what to show: breadcrumbs take precedence
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;

  return (
    <header
      className={cn(
        'h-12 flex items-center',
        'bg-white border-b border-neutral-200',
        'px-5',
        className
      )}
      role="banner"
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section */}
        <div className="flex items-center min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={openMobile}
            className={cn(
              'mr-3 p-1 -ml-1 lg:hidden',
              'text-muted-foreground hover:text-foreground',
              'transition-colors duration-150 cursor-pointer'
            )}
            aria-label="Open navigation menu"
          >
            <List className="h-5 w-5" weight="bold" />
          </button>

          {/* Breadcrumbs or Title */}
          {hasBreadcrumbs ? (
            <Breadcrumb
              items={breadcrumbs}
              separator={<CaretRight className="h-3.5 w-3.5 text-muted-foreground" weight="bold" />}
              className="min-w-0"
            />
          ) : title ? (
            <Typography variant="paragraph-medium" className="text-foreground truncate">
              {title}
            </Typography>
          ) : null}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 shrink-0">
          {actions}

          {/* Notification Bell */}
          <button
            className={cn(
              'relative p-2 rounded-lg',
              'text-muted-foreground hover:bg-black/5',
              'transition-colors duration-150 cursor-pointer'
            )}
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" weight="regular" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
