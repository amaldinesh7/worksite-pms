import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';

/* ========================================
   TYPE DEFINITIONS
   ======================================== */
interface LayoutProps {
  /** Main content */
  children: ReactNode;
  /** Additional className for the layout container */
  className?: string;
}

/* ========================================
   LAYOUT COMPONENT
   ======================================== */
export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn('flex h-screen bg-neutral-50 overflow-hidden', className)}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden',
          'transition-[margin] duration-300 ease-out'
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ========================================
   PAGE CONTENT WRAPPER
   Used for scrollable content area below the header
   ======================================== */
interface PageContentProps {
  children?: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <main className={cn('flex-1 overflow-y-auto p-6', className)} role="main">
      {children}
    </main>
  );
}

export default Layout;
