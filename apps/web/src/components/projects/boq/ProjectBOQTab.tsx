/**
 * Project BOQ Tab
 *
 * Main container for the BOQ (Bill of Quantities) tab with:
 * - Excel-like BOQ Builder for editing
 * - Import/Export functionality
 * - Summary cards
 */

import { useState, useCallback } from 'react';

import { BOQBuilderContainer } from './builder';
import { BOQImportView } from './BOQImportView';

// ============================================
// Types
// ============================================

interface ProjectBOQTabProps {
  projectId: string;
  projectName?: string;
}

// ============================================
// Component
// ============================================

export function ProjectBOQTab({ projectId, projectName }: ProjectBOQTabProps) {
  const [isShowingImport, setIsShowingImport] = useState(false);

  // Handlers
  const handleImport = useCallback(() => {
    setIsShowingImport(true);
  }, []);

  const handleImportBack = useCallback(() => {
    setIsShowingImport(false);
  }, []);

  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    console.log('Export BOQ');
  }, []);

  // Show Import View when importing
  if (isShowingImport) {
    return (
      <BOQImportView projectId={projectId} projectName={projectName} onBack={handleImportBack} />
    );
  }

  return (
    <div className="space-y-6">
      {/* BOQ Builder - Excel-like editor */}
      <BOQBuilderContainer
        projectId={projectId}
        projectName={projectName}
        onImport={handleImport}
        onExport={handleExport}
      />
    </div>
  );
}
