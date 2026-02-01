/**
 * BOQ Builder Container
 *
 * Connects the BOQBuilder component with data fetching and batch mutations.
 * Uses Edit/Save mode with batch API calls to reduce network overhead.
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

import { useBOQItems, useBOQSections, useBatchUpdateBOQ } from '@/lib/hooks/useBOQ';
import type { BatchBOQInput } from '@/lib/api/boq';

import { BOQBuilder, type BatchChanges } from './BOQBuilder';
import type { BOQBuilderSection, BOQBuilderItem } from './types';

// ============================================
// Types
// ============================================

interface BOQBuilderContainerProps {
  projectId: string;
  projectName?: string;
  onImport?: () => void;
  onExport?: () => void;
}

// ============================================
// Component
// ============================================

export function BOQBuilderContainer({
  projectId,
  projectName,
  onImport,
  onExport,
}: BOQBuilderContainerProps) {
  // Data fetching
  const { data: itemsData, isLoading: isItemsLoading } = useBOQItems(projectId, { limit: 500 });
  const { data: sectionsData, isLoading: isSectionsLoading } = useBOQSections(projectId);

  // Batch mutation
  const batchMutation = useBatchUpdateBOQ(projectId);

  // Transform data to builder format
  const sections: BOQBuilderSection[] = (sectionsData || []).map((s) => ({
    id: s.id,
    name: s.name,
    sortOrder: s.sortOrder,
  }));

  const items: BOQBuilderItem[] = (itemsData?.items || []).map((item) => ({
    id: item.id,
    sectionId: item.sectionId || null,
    code: item.code || null,
    description: item.description,
    unit: item.unit,
    quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)),
    rate: typeof item.rate === 'number' ? item.rate : parseFloat(String(item.rate)),
    isReviewFlagged: item.isReviewFlagged,
    flagReason: item.flagReason,
  }));

  // Handle batch save
  const handleSave = useCallback(
    async (changes: BatchChanges): Promise<void> => {
      // Transform BatchChanges to BatchBOQInput
      const input: BatchBOQInput = {
        itemUpdates: changes.itemUpdates.map((u) => ({
          id: u.id,
          changes: {
            sectionId: u.changes.sectionId,
            code: u.changes.code,
            description: u.changes.description,
            unit: u.changes.unit,
            quantity: u.changes.quantity,
            rate: u.changes.rate,
          },
        })),
        itemCreates: changes.itemCreates.map((c) => ({
          sectionId: c.sectionId,
          code: c.code,
          description: c.description,
          unit: c.unit,
          quantity: c.quantity,
          rate: c.rate,
        })),
        itemDeletes: changes.itemDeletes,
        sectionUpdates: changes.sectionUpdates.map((u) => ({
          id: u.id,
          changes: {
            name: u.changes.name,
            sortOrder: u.changes.sortOrder,
          },
        })),
        sectionCreates: changes.sectionCreates.map((c) => ({
          name: c.name,
          sortOrder: c.sortOrder,
        })),
        sectionDeletes: changes.sectionDeletes,
      };

      try {
        await batchMutation.mutateAsync(input);
        toast.success('Saved BOQ successfully');
      } catch (error) {
        toast.error('Failed to save changes');
        throw error;
      }
    },
    [batchMutation]
  );

  return (
    <BOQBuilder
      projectId={projectId}
      projectName={projectName}
      sections={sections}
      items={items}
      isLoading={isItemsLoading || isSectionsLoading}
      isSaving={batchMutation.isPending}
      onSave={handleSave}
      onImport={onImport}
      onExport={onExport}
    />
  );
}
