/**
 * Project BOQ Tab
 *
 * Main container for the BOQ (Bill of Quantities) tab with:
 * - Summary cards
 * - View toggle (All Items / By Category / By Stage)
 * - Add/Import actions
 */

import { useState, useCallback } from 'react';
import { Plus, Upload } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBOQStats } from '@/lib/hooks/useBOQ';
import { BOQSummaryCards } from './BOQSummaryCards';
import { BOQAllItemsView } from './BOQAllItemsView';
import { BOQCategoryView } from './BOQCategoryView';
import { BOQStageView } from './BOQStageView';
import { BOQItemFormDialog } from './BOQItemFormDialog';
import { BOQImportDialog } from './BOQImportDialog';
import { BOQImportReview } from './BOQImportReview';
import type { ParseResult } from '@/lib/api/boq';

// ============================================
// Types
// ============================================

interface ProjectBOQTabProps {
  projectId: string;
}

type ViewMode = 'all' | 'category' | 'stage';

// ============================================
// Component
// ============================================

export function ProjectBOQTab({ projectId }: ProjectBOQTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  // Data fetching
  const { data: stats, isLoading: isStatsLoading } = useBOQStats(projectId);

  // Handlers
  const handleAddItem = useCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  const handleImport = useCallback(() => {
    setIsImportDialogOpen(true);
  }, []);

  const handleParseComplete = useCallback((result: ParseResult) => {
    setParseResult(result);
  }, []);

  const handleImportReviewBack = useCallback(() => {
    setParseResult(null);
    setIsImportDialogOpen(true);
  }, []);

  const handleImportComplete = useCallback(() => {
    setParseResult(null);
  }, []);

  // Show import review screen if we have parse results
  if (parseResult) {
    return (
      <BOQImportReview
        projectId={projectId}
        parseResult={parseResult}
        onBack={handleImportReviewBack}
        onComplete={handleImportComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Project Budget & BOQ</h2>
          <p className="text-sm text-muted-foreground">
            Manage quoted items and track actual spending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleImport} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Import BOQ
          </Button>
          <Button onClick={handleAddItem} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Add Budget Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <BOQSummaryCards stats={stats} isLoading={isStatsLoading} />

      {/* View Toggle */}
      <div className="flex items-center justify-between border-b pb-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="all" className="cursor-pointer">
              All Items
            </TabsTrigger>
            <TabsTrigger value="category" className="cursor-pointer">
              By Category
            </TabsTrigger>
            <TabsTrigger value="stage" className="cursor-pointer">
              By Stage
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'all' && (
        <BOQAllItemsView projectId={projectId} onAddItem={handleAddItem} />
      )}
      {viewMode === 'category' && <BOQCategoryView projectId={projectId} />}
      {viewMode === 'stage' && <BOQStageView projectId={projectId} />}

      {/* Add Item Dialog */}
      <BOQItemFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId}
      />

      {/* Import Dialog */}
      <BOQImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        projectId={projectId}
        onParseComplete={handleParseComplete}
      />
    </div>
  );
}
