import { useCallback, useEffect, useRef, useState } from 'react';
import {
  House,
  Folder,
  Users,
  CreditCard,
  CurrencyDollar,
  Money,
  ListChecks,
  FileText,
  ChartBar,
  GridFour,
  Gear,
  CaretLeft,
  CaretRight,
  DotsThreeVertical,
  User,
  Bell,
  SignOut,
  Buildings,
  HardHat,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar';
import { useAuthStore } from '@/stores/auth.store';

/* ========================================
   TYPE DEFINITIONS
   ======================================== */
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

/* ========================================
   NAVIGATION DATA
   ======================================== */
const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: House, href: '/' },
  { id: 'projects', label: 'Projects', icon: Folder, href: '/projects', badge: 12 },
  { id: 'team', label: 'Team Directory', icon: Users, href: '/team', badge: 24 },
  { id: 'credits', label: 'Credits Hub', icon: CreditCard, href: '/credits' },
];

const managementSection: NavSection = {
  id: 'management',
  title: 'Management',
  items: [
    { id: 'expenses', label: 'Expenses', icon: CurrencyDollar, href: '/expenses' },
    { id: 'payments', label: 'Payments', icon: Money, href: '/payments' },
    { id: 'stages', label: 'Stages', icon: ListChecks, href: '/stages' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/documents' },
    { id: 'reports', label: 'Reports', icon: ChartBar, href: '/reports' },
  ],
};

const settingsSection: NavSection = {
  id: 'settings',
  title: 'Settings',
  items: [
    { id: 'categories', label: 'Categories', icon: GridFour, href: '/categories' },
    { id: 'settings', label: 'Settings', icon: Gear, href: '/settings' },
  ],
};

/* ========================================
   TOOLTIP COMPONENT (Portal-free, overflow-safe)
   ======================================== */
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  show: boolean;
}

function Tooltip({ content, children, show }: TooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }
  }, [show]);

  return (
    <div ref={triggerRef} className="relative">
      {children}
      {show && (
        <div
          className={cn(
            'fixed z-100 px-2.5 py-1.5',
            'rounded-md bg-neutral-800 text-xs text-white',
            'whitespace-nowrap shadow-lg',
            'pointer-events-none',
            '-translate-y-1/2'
          )}
          style={{ top: position.top, left: position.left }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}

/* ========================================
   NAV ITEM COMPONENT
   ======================================== */
interface NavItemButtonProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: (href: string) => void;
}

function NavItemButton({ item, isCollapsed, isActive, onClick }: NavItemButtonProps) {
  const Icon = item.icon;
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(item.href);
    // Update URL without page reload
    window.history.pushState({}, '', item.href);
  };

  const tooltipContent = (
    <>
      {item.label}
      {item.badge !== undefined && (
        <span className="ml-2 px-1.5 py-0.5 rounded bg-neutral-600 text-xs">{item.badge}</span>
      )}
    </>
  );

  const linkContent = (
    <a
      href={item.href}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center rounded-lg',
        'transition-colors duration-150',
        isCollapsed ? 'px-3 py-2 justify-center' : 'px-3 py-2',
        isActive ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-600 hover:bg-neutral-50'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'h-5 w-5 shrink-0',
          isActive ? 'text-neutral-700' : 'text-neutral-500',
          !isCollapsed && 'mr-3'
        )}
        weight={isActive ? 'fill' : 'regular'}
      />

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span
              className={cn(
                'ml-auto px-2 py-0.5 rounded-full',
                'text-xs font-medium',
                'bg-neutral-200 text-neutral-700'
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </a>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={tooltipContent} show={isHovered}>
        {linkContent}
      </Tooltip>
    );
  }

  return linkContent;
}

/* ========================================
   NAV SECTION COMPONENT
   ======================================== */
interface NavSectionComponentProps {
  section: NavSection;
  isCollapsed: boolean;
  activePath: string;
  onItemClick?: (href: string) => void;
}

function NavSectionComponent({
  section,
  isCollapsed,
  activePath,
  onItemClick,
}: NavSectionComponentProps) {
  return (
    <div className="pt-4 border-t border-neutral-200">
      {!isCollapsed && (
        <h4 className="px-3 text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
          {section.title}
        </h4>
      )}
      <nav className="space-y-1">
        {section.items.map((item) => (
          <NavItemButton
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            isActive={activePath === item.href}
            onClick={onItemClick}
          />
        ))}
      </nav>
    </div>
  );
}

/* ========================================
   PROFILE MENU COMPONENT
   ======================================== */
interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

function ProfileMenu({ isOpen, onClose, isCollapsed }: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, tokens } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    if (tokens?.refreshToken) {
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      } catch {
        // Ignore logout API errors
      }
    }
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute bottom-full mb-2 bg-white border border-neutral-200',
        'rounded-lg shadow-lg py-1 z-50',
        isCollapsed ? 'left-0 right-0' : 'left-3 right-3'
      )}
    >
      <a
        href="/profile"
        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <User className="mr-3 h-4 w-4 text-neutral-500" />
        <span>My Profile</span>
      </a>
      <a
        href="/account-settings"
        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <Gear className="mr-3 h-4 w-4 text-neutral-500" />
        <span>Account Settings</span>
      </a>
      <a
        href="/notifications"
        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <Bell className="mr-3 h-4 w-4 text-neutral-500" />
        <span>Notifications</span>
      </a>
      <div className="border-t border-neutral-200 my-1" />
      <button
        onClick={handleLogout}
        className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <SignOut className="mr-3 h-4 w-4 text-neutral-500" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}

/* ========================================
   SIDEBAR COMPONENT
   ======================================== */
interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const {
    isCollapsed,
    isMobileOpen,
    isProfileMenuOpen,
    toggleCollapse,
    closeMobile,
    toggleProfileMenu,
    closeProfileMenu,
  } = useSidebarStore();

  const { user } = useAuthStore();

  // Track active path
  const [activePath, setActivePath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setActivePath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle navigation item click
  const handleNavClick = (href: string) => {
    setActivePath(href);
    closeMobile();
  };

  // Close mobile sidebar on escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMobileOpen) closeMobile();
        if (isProfileMenuOpen) closeProfileMenu();
      }
    },
    [isMobileOpen, isProfileMenuOpen, closeMobile, closeProfileMenu]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const effectiveCollapsed = isCollapsed && !isMobileOpen;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden',
          'transition-opacity duration-200',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen',
          'bg-white border-r border-neutral-200',
          'flex flex-col relative',
          'transition-all duration-300 ease-out',
          // Width based on collapse state
          isCollapsed ? 'w-16' : 'w-64',
          // Mobile: slide in/out (always expanded on mobile)
          '-translate-x-full lg:translate-x-0',
          isMobileOpen && 'translate-x-0 w-64',
          // Prevent horizontal overflow from tooltips
          'overflow-visible',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header / Branding - FIXED HEIGHT to match main header */}
        <div
          className={cn(
            'h-[65px] flex items-center border-b border-neutral-200',
            effectiveCollapsed ? 'px-3 justify-center' : 'px-4'
          )}
        >
          <div
            className={cn(
              'flex items-center',
              effectiveCollapsed ? 'justify-center' : 'justify-between w-full'
            )}
          >
            <div className="flex items-center">
              {/* Logo */}
              <div
                className={cn(
                  'w-10 h-10 rounded-lg shrink-0',
                  'bg-neutral-200 text-neutral-600',
                  'flex items-center justify-center',
                  !effectiveCollapsed && 'mr-3'
                )}
              >
                <Buildings className="h-5 w-5" weight="fill" />
              </div>

              {!effectiveCollapsed && (
                <div>
                  <p className="font-heading font-semibold text-neutral-800 leading-tight">
                    Acme Construction
                  </p>
                  <p className="text-xs text-neutral-500">Company Portal</p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            {!effectiveCollapsed && (
              <button
                onClick={closeMobile}
                className="text-neutral-400 hover:text-neutral-600 p-1 lg:hidden"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation - overflow only on y-axis */}
        <nav className="flex-1 overflow-y-auto overflow-x-visible p-3">
          {/* Main Navigation */}
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.id}>
                <NavItemButton
                  item={item}
                  isCollapsed={effectiveCollapsed}
                  isActive={activePath === item.href}
                  onClick={handleNavClick}
                />
              </li>
            ))}
          </ul>

          {/* Management Section */}
          <div className="mt-6">
            <NavSectionComponent
              section={managementSection}
              isCollapsed={effectiveCollapsed}
              activePath={activePath}
              onItemClick={handleNavClick}
            />
          </div>

          {/* Settings Section */}
          <div className="mt-6">
            <NavSectionComponent
              section={settingsSection}
              isCollapsed={effectiveCollapsed}
              activePath={activePath}
              onItemClick={handleNavClick}
            />
          </div>
        </nav>

        {/* Footer Section */}
        <div className="border-t border-neutral-200 p-3">
          {/* User Profile */}
          <div className="relative">
            <div
              className={cn(
                'flex items-center px-3 py-2 mb-3',
                effectiveCollapsed && 'justify-center px-0'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full shrink-0 bg-neutral-200 flex items-center justify-center',
                  !effectiveCollapsed && 'mr-3'
                )}
              >
                <span className="text-sm font-medium text-neutral-600">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              {!effectiveCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-neutral-500 truncate">{user?.phone || ''}</p>
                  </div>
                  <button
                    onClick={toggleProfileMenu}
                    className="text-neutral-400 hover:text-neutral-600 p-1"
                    aria-label="User menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <DotsThreeVertical className="h-5 w-5" weight="bold" />
                  </button>
                </>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            <ProfileMenu
              isOpen={isProfileMenuOpen}
              onClose={closeProfileMenu}
              isCollapsed={effectiveCollapsed}
            />
          </div>

          {/* Powered By Branding */}
          <div
            className={cn(
              'flex items-center rounded-lg bg-neutral-50',
              effectiveCollapsed ? 'p-2 justify-center' : 'px-3 py-2'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg shrink-0',
                'bg-neutral-700 text-white',
                'flex items-center justify-center',
                !effectiveCollapsed && 'mr-3'
              )}
            >
              <HardHat className="h-4 w-4" weight="fill" />
            </div>

            {!effectiveCollapsed && (
              <div>
                <p className="text-xs text-neutral-600">Powered by</p>
                <p className="text-sm font-medium text-neutral-800">SiteMate</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className={cn(
            'absolute -right-3 top-7 z-60',
            'w-6 h-6 rounded-full',
            'bg-white border border-neutral-200 shadow-sm',
            'flex items-center justify-center',
            'text-neutral-600 hover:bg-neutral-50',
            'transition-colors duration-150',
            'hidden lg:flex',
            'focus:outline-none focus:ring-2 focus:ring-neutral-300'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <CaretRight className="h-3 w-3" weight="bold" />
          ) : (
            <CaretLeft className="h-3 w-3" weight="bold" />
          )}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
