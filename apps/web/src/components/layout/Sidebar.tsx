import { useCallback, useEffect } from 'react';
import { CaretLeft, CaretRight, DotsThreeVertical, X, Buildings } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar';
import { useAuthStore, type UserRole } from '@/stores/auth.store';
import {
  NavItemButton,
  NavSection,
  ProfileMenu,
  mainNavItems,
  settingsSection,
} from './sidebar/index';

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

  const { user, userRole } = useAuthStore();

  // Close mobile menu on navigation
  const handleNavClick = () => {
    closeMobile();
  };

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

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
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
          // Base styles
          'bg-white border-r border-neutral-200',
          'flex flex-col overflow-visible',
          'transition-all duration-300 ease-out',

          // Desktop (lg+): Static flex child in layout flow
          'hidden lg:flex lg:relative lg:h-full lg:shrink-0',
          isCollapsed ? 'lg:w-16' : 'lg:w-[232px]',

          // Mobile (<lg): Fixed overlay when open
          'max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:z-50 max-lg:h-screen',
          'max-lg:w-[232px]',
          isMobileOpen ? 'max-lg:flex max-lg:translate-x-0' : 'max-lg:-translate-x-full',

          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <SidebarHeader isCollapsed={effectiveCollapsed} onCloseMobile={closeMobile} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-visible px-3 pt-6 pb-3">
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.id}>
                <NavItemButton
                  item={item}
                  isCollapsed={effectiveCollapsed}
                  onClick={handleNavClick}
                />
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <NavSection
              section={settingsSection}
              isCollapsed={effectiveCollapsed}
              onItemClick={handleNavClick}
            />
          </div>
        </nav>

        {/* Footer */}
        <SidebarFooter
          isCollapsed={effectiveCollapsed}
          user={user}
          userRole={userRole}
          isProfileMenuOpen={isProfileMenuOpen}
          onToggleProfileMenu={toggleProfileMenu}
          onCloseProfileMenu={closeProfileMenu}
        />

        {/* Collapse Toggle */}
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

/* ========================================
   SIDEBAR HEADER
   ======================================== */
interface SidebarHeaderProps {
  isCollapsed: boolean;
  onCloseMobile: () => void;
}

function SidebarHeader({ isCollapsed, onCloseMobile }: SidebarHeaderProps) {
  const { organization } = useAuthStore();
  const orgName = organization?.name || 'My Organization';
  const hasLogo = Boolean(organization?.logoUrl);

  return (
    <div className={cn('border-b border-neutral-200', isCollapsed ? 'px-3 py-4' : 'px-4 py-4')}>
      <div
        className={cn(
          'flex items-center gap-3',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <div className={cn('flex items-center gap-3 min-w-0', isCollapsed && 'justify-center')}>
          {/* Logo/Icon Container */}
          {hasLogo ? (
            <img
              src={organization?.logoUrl || ''}
              alt={orgName}
              className="w-8 h-8 rounded-[6.4px] object-cover shrink-0"
            />
          ) : (
            <div
              className={cn(
                'w-8 h-8 rounded-[6.4px] shrink-0',
                'bg-btn-primary text-btn-primary-foreground',
                'flex items-center justify-center'
              )}
            >
              <Buildings className="h-4 w-4" weight="fill" />
            </div>
          )}

          {/* Organization Name */}
          {!isCollapsed && (
            <span
              className="text-base font-medium text-secondary-foreground leading-tight line-clamp-2 overflow-wrap-break-word max-w-[140px]"
              title={orgName}
            >
              {orgName}
            </span>
          )}
        </div>

        {/* Mobile Close Button */}
        {!isCollapsed && (
          <button
            onClick={onCloseMobile}
            className="text-muted-foreground hover:text-foreground p-1 lg:hidden cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ========================================
   SIDEBAR FOOTER
   ======================================== */
interface SidebarFooterProps {
  isCollapsed: boolean;
  user: { name: string; phone: string } | null;
  userRole: UserRole | null;
  isProfileMenuOpen: boolean;
  onToggleProfileMenu: () => void;
  onCloseProfileMenu: () => void;
}

function SidebarFooter({
  isCollapsed,
  user,
  userRole,
  isProfileMenuOpen,
  onToggleProfileMenu,
  onCloseProfileMenu,
}: SidebarFooterProps) {
  // Format role for display
  const getRoleDisplay = (role: UserRole | null): string => {
    if (!role) return '';
    const roleMap: Record<UserRole, string> = {
      ADMIN: 'Admin',
      MANAGER: 'Manager',
      ACCOUNTANT: 'Accountant',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="border-t border-neutral-200 pt-[13px] pb-3 px-3">
      <div className="relative">
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            isCollapsed && 'justify-center px-0'
          )}
        >
          {/* User Avatar */}
          <div
            className={cn(
              'w-8 h-8 rounded-full shrink-0 bg-muted flex items-center justify-center overflow-hidden'
            )}
          >
            <span className="text-sm font-medium text-muted-foreground">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>

          {!isCollapsed && (
            <>
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium leading-[20px] text-secondary-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[12px] leading-[16px] text-muted-foreground truncate">
                  {getRoleDisplay(userRole)}
                </p>
              </div>

              {/* Menu Button */}
              <button
                onClick={onToggleProfileMenu}
                className="p-2 rounded-lg text-muted-foreground hover:bg-black/5 cursor-pointer"
                aria-label="User menu"
              >
                <DotsThreeVertical className="h-5 w-5" weight="bold" />
              </button>
            </>
          )}
        </div>

        <ProfileMenu
          isOpen={isProfileMenuOpen}
          onClose={onCloseProfileMenu}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
}

export default Sidebar;
