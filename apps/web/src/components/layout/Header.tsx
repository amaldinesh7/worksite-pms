import type { ReactNode } from 'react';
import { List, MagnifyingGlass, Bell, Plus } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar';

/* ========================================
   TYPE DEFINITIONS
   ======================================== */
interface HeaderProps {
  /** Page title displayed in the header */
  title?: string;
  /** Subtitle/description below the title */
  subtitle?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Show search bar */
  showSearch?: boolean;
  /** Primary action button text */
  primaryActionLabel?: string;
  /** Primary action button icon */
  primaryActionIcon?: React.ElementType;
  /** Callback when primary action button is clicked */
  onPrimaryAction?: () => void;
  /** Custom action buttons (overrides default) */
  actions?: ReactNode;
  /** Additional className */
  className?: string;
}

/* ========================================
   HEADER COMPONENT
   ======================================== */
export function Header({
  title = 'Dashboard Overview',
  subtitle,
  searchPlaceholder = 'Search projects...',
  showSearch = true,
  primaryActionLabel = 'New Project',
  primaryActionIcon: PrimaryIcon = Plus,
  onPrimaryAction,
  actions,
  className,
}: HeaderProps) {
  const { openMobile } = useSidebarStore();

  return (
    <header
      className={cn(
        'h-[65px] flex items-center',
        'bg-white border-b border-neutral-200',
        'px-6',
        className
      )}
      role="banner"
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={openMobile}
            className={cn(
              'mr-4 p-1 -ml-1 lg:hidden',
              'text-neutral-500 hover:text-neutral-700',
              'transition-colors duration-150'
            )}
            aria-label="Open navigation menu"
          >
            <List className="h-5 w-5" weight="bold" />
          </button>

          {/* Title Section */}
          <div>
            {title && (
              <h1 className="font-heading text-2xl font-semibold text-neutral-800 leading-tight">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Custom Actions or Default */}
          {actions ? (
            actions
          ) : (
            <>
              {/* Search Bar */}
              {showSearch && (
                <div className="relative hidden sm:block">
                  <MagnifyingGlass
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
                    weight="bold"
                  />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className={cn(
                      'w-64 pl-10 pr-4 py-2 text-sm',
                      'bg-neutral-100 border border-neutral-200 rounded-lg',
                      'placeholder:text-neutral-400 text-neutral-800',
                      'focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent',
                      'transition-all duration-150'
                    )}
                    aria-label={searchPlaceholder}
                  />
                </div>
              )}

              {/* Notification Bell */}
              <button
                className={cn(
                  'relative p-2 rounded-lg',
                  'text-neutral-500 hover:bg-neutral-100',
                  'transition-colors duration-150'
                )}
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {/* Notification Indicator */}
                <span
                  className={cn('absolute top-1 right-1', 'w-2 h-2 rounded-full', 'bg-neutral-500')}
                />
              </button>

              {/* Primary Action Button */}
              {primaryActionLabel && (
                <Button onClick={onPrimaryAction}>
                  <PrimaryIcon className="mr-2 h-4 w-4" weight="bold" />
                  {primaryActionLabel}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ========================================
   BUTTON COMPONENT (shadcn-style)
   ======================================== */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'rounded-lg transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400',
        'disabled:opacity-50 disabled:pointer-events-none',
        // Variants
        variant === 'primary' && ['bg-neutral-800 text-white', 'hover:bg-neutral-900'],
        variant === 'secondary' && ['bg-neutral-100 text-neutral-800', 'hover:bg-neutral-200'],
        variant === 'outline' && [
          'border border-neutral-300 bg-white text-neutral-700',
          'hover:bg-neutral-50',
        ],
        variant === 'ghost' && ['text-neutral-600', 'hover:bg-neutral-100 hover:text-neutral-800'],
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-5 py-2.5 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Header;
