/**
 * useDocumentTitle Hook
 *
 * Sets the document title with a consistent format: "{pageName} | Worksite"
 * Reverts to "Worksite" when the component unmounts.
 */

import { useEffect } from 'react';

const APP_NAME = 'Worksite';

/**
 * Hook to set the document title with consistent branding
 *
 * @param title - The page-specific title (e.g., "Projects", "Dashboard")
 *                If empty/null, defaults to just "Worksite"
 *
 * @example
 * // Sets title to "Projects | Worksite"
 * useDocumentTitle('Projects');
 *
 * @example
 * // Sets title to "Villa Construction | Worksite"
 * useDocumentTitle(project?.name);
 */
export function useDocumentTitle(title?: string | null): void {
  useEffect(() => {
    const previousTitle = document.title;

    if (title) {
      document.title = `${title} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }

    // Cleanup: restore previous title on unmount
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export default useDocumentTitle;
