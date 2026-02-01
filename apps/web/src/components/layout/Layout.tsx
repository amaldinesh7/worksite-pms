import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { FloatingImportStatus } from '@/components/imports/FloatingImportStatus';

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
    <div className={cn('flex h-screen bg-background-secondary overflow-hidden', className)}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - naturally fills remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>

      {/* Floating Import Status Bar */}
      <FloatingImportStatus />
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
    <main className={cn('flex-1 overflow-y-auto p-5', className)} role="main">
      {children}
    </main>
  );
}

export default Layout;
