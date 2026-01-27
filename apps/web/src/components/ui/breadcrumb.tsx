import * as React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// Types
// ============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Maximum number of items to show before collapsing. Default: 4 */
  maxItems?: number;
  /** Number of items to show at start when collapsed. Default: 1 */
  itemsBeforeCollapse?: number;
  /** Number of items to show at end when collapsed. Default: 2 */
  itemsAfterCollapse?: number;
  /** Custom separator element */
  separator?: React.ReactNode;
}

// ============================================
// Sub-components (shadcn-style composable API)
// ============================================

const BreadcrumbRoot = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'nav'>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn('flex items-center', className)}
      {...props}
    />
  )
);
BreadcrumbRoot.displayName = 'BreadcrumbRoot';

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn('flex flex-wrap items-center  text-sm break-words', className)}
      {...props}
    />
  )
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItemWrapper = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('inline-flex items-center px-2', className)} {...props} />
  )
);
BreadcrumbItemWrapper.displayName = 'BreadcrumbItemWrapper';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, ...props }, ref) => (
  <Link
    ref={ref}
    className={cn(
      'text-muted-foreground transition-colors duration-150',
      'hover:text-foreground hover:underline underline-offset-4',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm',
      className
    )}
    {...props}
  />
));
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-foreground font-medium', className)}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRight className="text-muted-foreground" />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// ============================================
// Main Component (with truncation support)
// ============================================

export function Breadcrumb({
  items,
  className,
  maxItems = 4,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 2,
  separator,
}: BreadcrumbProps) {
  const shouldCollapse = items.length > maxItems;

  // Calculate which items to show and which to collapse
  const visibleItems = React.useMemo(() => {
    if (!shouldCollapse) {
      return { before: items, collapsed: [], after: [] };
    }

    const before = items.slice(0, itemsBeforeCollapse);
    const after = items.slice(-itemsAfterCollapse);
    const collapsed = items.slice(itemsBeforeCollapse, -itemsAfterCollapse);

    return { before, collapsed, after };
  }, [items, shouldCollapse, itemsBeforeCollapse, itemsAfterCollapse]);

  const renderItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const content = (
      <>
        {item.icon && <span className="mr-1.5">{item.icon}</span>}
        {item.label}
      </>
    );

    return (
      <React.Fragment key={index}>
        <BreadcrumbItemWrapper>
          {item.href && !isLast ? (
            <BreadcrumbLink to={item.href}>{content}</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{content}</BreadcrumbPage>
          )}
        </BreadcrumbItemWrapper>
        {!isLast && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
      </React.Fragment>
    );
  };

  const renderCollapsedMenu = () => {
    if (visibleItems.collapsed.length === 0) return null;

    return (
      <React.Fragment>
        <BreadcrumbItemWrapper>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex items-center gap-1 rounded-sm px-1 py-0.5',
                'text-muted-foreground transition-colors duration-150',
                'hover:text-foreground hover:bg-accent',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              <BreadcrumbEllipsis className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {visibleItems.collapsed.map((item, idx) => (
                <DropdownMenuItem key={idx} asChild={!!item.href}>
                  {item.href ? (
                    <Link to={item.href}>
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </Link>
                  ) : (
                    <span>
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItemWrapper>
        <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
      </React.Fragment>
    );
  };

  if (!shouldCollapse) {
    // Render all items without collapsing
    return (
      <BreadcrumbRoot className={className}>
        <BreadcrumbList>
          {items.map((item, index) => renderItem(item, index, index === items.length - 1))}
        </BreadcrumbList>
      </BreadcrumbRoot>
    );
  }

  // Render with collapsed items
  return (
    <BreadcrumbRoot className={className}>
      <BreadcrumbList>
        {/* Items before collapse */}
        {visibleItems.before.map((item, index) => (
          <React.Fragment key={`before-${index}`}>{renderItem(item, index, false)}</React.Fragment>
        ))}

        {/* Collapsed items dropdown */}
        {renderCollapsedMenu()}

        {/* Items after collapse */}
        {visibleItems.after.map((item, index) => {
          const isLast = index === visibleItems.after.length - 1;
          return (
            <React.Fragment key={`after-${index}`}>
              {renderItem(
                item,
                visibleItems.before.length + visibleItems.collapsed.length + index,
                isLast
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}

// Export composable sub-components for advanced usage
export {
  BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItemWrapper as BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

export default Breadcrumb;
