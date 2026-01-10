import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  /** Whether sidebar is collapsed (icon-only mode) */
  isCollapsed: boolean;
  /** Whether mobile drawer is open */
  isMobileOpen: boolean;
  /** Whether user profile menu is open */
  isProfileMenuOpen: boolean;
  /** Toggle collapse state */
  toggleCollapse: () => void;
  /** Set collapse state directly */
  setCollapsed: (collapsed: boolean) => void;
  /** Open mobile sidebar */
  openMobile: () => void;
  /** Close mobile sidebar */
  closeMobile: () => void;
  /** Set mobile sidebar state */
  setMobileOpen: (open: boolean) => void;
  /** Toggle profile menu */
  toggleProfileMenu: () => void;
  /** Close profile menu */
  closeProfileMenu: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      isProfileMenuOpen: false,
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      openMobile: () => set({ isMobileOpen: true }),
      closeMobile: () => set({ isMobileOpen: false }),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
      toggleProfileMenu: () => set((state) => ({ isProfileMenuOpen: !state.isProfileMenuOpen })),
      closeProfileMenu: () => set({ isProfileMenuOpen: false }),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
