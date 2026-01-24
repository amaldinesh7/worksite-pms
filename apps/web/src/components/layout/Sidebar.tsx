import { useCallback, useEffect } from 'react';
import {
  CaretLeft,
  CaretRight,
  DotsThreeVertical,
  X,
  Buildings,
  HardHat,
} from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { TypographySmall, TypographyMuted, TypographyLarge } from '@/components/ui/typography';
import { useSidebarStore } from '@/stores/sidebar';
import { useAuthStore } from '@/stores/auth.store';
import {
  NavItemButton,
  NavSection,
  ProfileMenu,
  mainNavItems,
  settingsSection,
} from './sidebar/index';
import { ThemeToggle } from './sidebar/ThemeToggle';

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
          'fixed left-0 top-0 z-50 h-screen',
          'bg-white border-r border-neutral-200',
          'flex flex-col relative overflow-visible',
          'transition-all duration-300 ease-out',
          isCollapsed ? 'w-16' : 'w-64',
          '-translate-x-full lg:translate-x-0',
          isMobileOpen && 'translate-x-0 w-64',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <SidebarHeader isCollapsed={effectiveCollapsed} onCloseMobile={closeMobile} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-visible p-3">
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
  
  return (
    <div
      className={cn(
        'h-[65px] flex items-center border-b border-neutral-200',
        isCollapsed ? 'px-3 justify-center' : 'px-4'
      )}
    >
      <div
        className={cn(
          'flex items-center',
          isCollapsed ? 'justify-center' : 'justify-between w-full'
        )}
      >
        <div className="flex items-center min-w-0">
          <div
            className={cn(
              'w-10 h-10 rounded-lg shrink-0',
              'bg-neutral-200 text-neutral-600',
              'flex items-center justify-center',
              !isCollapsed && 'mr-3'
            )}
          >
            <Buildings className="h-5 w-5" weight="fill" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <TypographyLarge className="font-heading font-semibold text-neutral-800 leading-tight text-base truncate max-w-[140px]">
                {organization?.name || 'My Organization'}
              </TypographyLarge>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onCloseMobile}
            className="text-neutral-400 hover:text-neutral-600 p-1 lg:hidden"
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
  isProfileMenuOpen: boolean;
  onToggleProfileMenu: () => void;
  onCloseProfileMenu: () => void;
}

function SidebarFooter({
  isCollapsed,
  user,
  isProfileMenuOpen,
  onToggleProfileMenu,
  onCloseProfileMenu,
}: SidebarFooterProps) {
  return (
    <div className="border-t border-neutral-200 p-3">
      {/* User Profile */}
      <div className="relative">
        <div
          className={cn('flex items-center px-3 py-2 mb-3', isCollapsed && 'justify-center px-0')}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-full shrink-0 bg-neutral-200 flex items-center justify-center',
              !isCollapsed && 'mr-3'
            )}
          >
            <TypographySmall className="text-neutral-600 font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </TypographySmall>
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <TypographySmall className="text-neutral-800 truncate">
                  {user?.name || 'User'}
                </TypographySmall>
                <TypographyMuted className="text-xs truncate">{user?.phone || ''}</TypographyMuted>
              </div>
              <ThemeToggle />
              <button
                onClick={onToggleProfileMenu}
                className="text-neutral-400 hover:text-neutral-600 p-1"
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

      {/* Powered By */}
      <div
        className={cn(
          'flex items-center rounded-lg bg-neutral-50',
          isCollapsed ? 'p-2 justify-center' : 'px-3 py-2'
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-lg shrink-0 bg-neutral-700 text-white flex items-center justify-center',
            !isCollapsed && 'mr-3'
          )}
        >
          <HardHat className="h-4 w-4" weight="fill" />
        </div>
        {!isCollapsed && (
          <div>
            <TypographyMuted className="text-xs">Powered by</TypographyMuted>
            <TypographySmall className="text-neutral-800">SiteMate</TypographySmall>
          </div>
        )}
      </div>
    </div >
  );
}

export default Sidebar;
