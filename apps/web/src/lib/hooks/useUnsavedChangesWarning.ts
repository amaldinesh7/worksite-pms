import { useEffect, useCallback, useState } from 'react';

/**
 * Hook to warn users about unsaved changes when navigating away.
 *
 * Handles:
 * 1. Browser beforeunload event (page refresh, tab close) - shows native browser dialog
 *
 * Note: React Router's useBlocker requires a "data router" (createBrowserRouter).
 * Since this app uses <BrowserRouter>, we rely only on beforeunload for protection.
 * The blocking/confirmation UI pattern is kept for future migration to data router.
 *
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @returns Object with blocker state and control functions
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  // Track blocked state manually (no-op when not using data router)
  // This allows the component to still show a confirmation dialog if needed
  const [isBlocked, setIsBlocked] = useState(false);

  // Handle browser beforeunload event (refresh, tab close, browser navigation)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Standard way to show browser's native "Leave site?" dialog
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Confirm navigation (proceed with the blocked navigation)
  // Note: This is a no-op without data router, but kept for API compatibility
  const confirmNavigation = useCallback(() => {
    setIsBlocked(false);
  }, []);

  // Cancel navigation (stay on the current page)
  // Note: This is a no-op without data router, but kept for API compatibility
  const cancelNavigation = useCallback(() => {
    setIsBlocked(false);
  }, []);

  return {
    // Whether the navigation prompt should be shown
    // Without data router, this will always be false (no in-app navigation blocking)
    isBlocked,
    // Proceed with navigation
    confirmNavigation,
    // Cancel navigation and stay on page
    cancelNavigation,
  };
}
