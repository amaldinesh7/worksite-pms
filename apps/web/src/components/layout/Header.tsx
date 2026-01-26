import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { List, Bell, CaretRight } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

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

export function Header({
  title,
  breadcrumbs,
  actions,
  className,
}: HeaderProps) {
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
            <nav aria-label="Breadcrumb" className="flex items-center min-w-0">
              <ol className="flex items-center gap-1 min-w-0">
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={index} className="flex items-center min-w-0">
                      {index > 0 && (
                        <CaretRight
                          className="h-3.5 w-3.5 mx-1 text-muted-foreground shrink-0"
                          weight="bold"
                        />
                      )}
                      {item.href && !isLast ? (
                        <Link
                          to={item.href}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors truncate cursor-pointer"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className={cn(
                            'text-xs font-medium truncate',
                            isLast ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : title ? (
            <h1 className="text-sm font-medium text-foreground truncate">{title}</h1>
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
