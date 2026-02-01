/**
 * BOQ Builder
 *
 * Main component for the Excel-like BOQ editor.
 * Features:
 * - View/Edit mode toggle
 * - Collapsible sections
 * - Inline editing of cells (in edit mode only)
 * - Keyboard navigation (Tab, Enter, Arrow keys)
 * - Add/delete sections and items
 * - Batch save (single API call for all changes)
 * - Computed totals
 * - Unsaved changes warning on navigation
 */

import { useState, useMemo, useCallback, useEffect, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Files, Upload } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty';

import { toast } from 'sonner';
import { useUnsavedChangesWarning } from '@/lib/hooks/useUnsavedChangesWarning';
import { uploadBOQItemImage } from '@/lib/api/boq';
import { BOQHeader } from './BOQHeader';
import { BOQSectionRow } from './BOQSectionRow';
import { BOQItemRow } from './BOQItemRow';
import { BOQAddRow, BOQAddSectionRow } from './BOQAddRow';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import {
  DEFAULT_COLUMNS,
  type BOQBuilderSection,
  type BOQBuilderItem,
  type EditingCell,
  type PendingImage,
  type PendingImagesMap,
} from './types';

// ============================================
// Types
// ============================================

export interface BatchChanges {
  itemUpdates: Array<{ id: string; changes: Partial<BOQBuilderItem> }>;
  itemCreates: Array<Omit<BOQBuilderItem, 'id'> & { tempId: string }>;
  itemDeletes: string[];
  sectionUpdates: Array<{ id: string; changes: Partial<BOQBuilderSection> }>;
  sectionCreates: Array<Omit<BOQBuilderSection, 'id'> & { tempId: string }>;
  sectionDeletes: string[];
}

/**
 * Result returned from batch save, mapping temp IDs to real IDs
 */
export interface BatchSaveResult {
  // Map of temp item IDs to their real database IDs
  itemIdMap?: Map<string, string>;
  // Map of temp section IDs to their real database IDs
  sectionIdMap?: Map<string, string>;
}

interface BOQBuilderProps {
  projectId?: string;
  projectName?: string;
  sections: BOQBuilderSection[];
  items: BOQBuilderItem[];
  isLoading?: boolean;
  isSaving?: boolean;
  // Batch save handler - returns mapping of temp IDs to real IDs
  onSave?: (changes: BatchChanges) => Promise<BatchSaveResult | void>;
  // UI handlers
  onImport?: () => void;
  onExport?: () => void;
}

// ============================================
// Helper: Generate temp ID
// ============================================

let tempIdCounter = 0;
const generateTempId = () => `temp-${Date.now()}-${++tempIdCounter}`;

// ============================================
// Component
// ============================================

export function BOQBuilder({
  projectId,
  projectName: _projectName,
  sections: serverSections,
  items: serverItems,
  isLoading = false,
  isSaving = false,
  onSave,
  onImport,
  onExport: _onExport,
}: BOQBuilderProps) {
  // ============================================
  // Edit Mode State
  // ============================================

  const [isEditMode, setIsEditMode] = useState(false);

  // Local copies of data (used in edit mode)
  const [localSections, setLocalSections] = useState<BOQBuilderSection[]>([]);
  const [localItems, setLocalItems] = useState<BOQBuilderItem[]>([]);

  // Track changes for batch save
  const [itemChanges, setItemChanges] = useState<Map<string, Partial<BOQBuilderItem>>>(new Map());
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [deletedItemIds, setDeletedItemIds] = useState<Set<string>>(new Set());

  const [sectionChanges, setSectionChanges] = useState<Map<string, Partial<BOQBuilderSection>>>(
    new Map()
  );
  const [newSectionIds, setNewSectionIds] = useState<Set<string>>(new Set());
  const [deletedSectionIds, setDeletedSectionIds] = useState<Set<string>>(new Set());

  // Track pending images (not yet uploaded)
  const [pendingImages, setPendingImages] = useState<PendingImagesMap>(new Map());
  // Track images to delete on save
  const [pendingImageDeletes, setPendingImageDeletes] = useState<Set<string>>(new Set());

  // ============================================
  // UI State
  // ============================================

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    return new Set(serverSections.map((s) => s.id));
  });
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  // ============================================
  // Derived State
  // ============================================

  // Use local data in edit mode, server data in view mode
  const sections = isEditMode ? localSections : serverSections;
  const items = isEditMode ? localItems : serverItems;

  // Columns configuration
  const columns = DEFAULT_COLUMNS;

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return (
      itemChanges.size > 0 ||
      newItemIds.size > 0 ||
      deletedItemIds.size > 0 ||
      sectionChanges.size > 0 ||
      newSectionIds.size > 0 ||
      deletedSectionIds.size > 0 ||
      pendingImages.size > 0 ||
      pendingImageDeletes.size > 0
    );
  }, [
    itemChanges,
    newItemIds,
    deletedItemIds,
    sectionChanges,
    newSectionIds,
    deletedSectionIds,
    pendingImages,
    pendingImageDeletes,
  ]);

  // Group items by section
  const itemsBySection = useMemo(() => {
    const map = new Map<string | null, BOQBuilderItem[]>();
    const validSectionIds = new Set(sections.map((s) => s.id));

    // Initialize with all sections (including null for unassigned)
    map.set(null, []);
    sections.forEach((s) => map.set(s.id, []));

    // Group items - treat orphaned sectionIds as unassigned
    items.forEach((item) => {
      const sectionId =
        item.sectionId && validSectionIds.has(item.sectionId) ? item.sectionId : null;
      const list = map.get(sectionId) || [];
      list.push(item);
      map.set(sectionId, list);
    });

    return map;
  }, [sections, items]);

  // Calculate totals
  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  }, [items]);

  // Calculate section totals
  const sectionTotals = useMemo(() => {
    const totals = new Map<string, number>();
    sections.forEach((section) => {
      const sectionItems = itemsBySection.get(section.id) || [];
      const total = sectionItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
      totals.set(section.id, total);
    });
    return totals;
  }, [sections, itemsBySection]);

  // Check if BOQ has existing data
  const hasExistingBOQ = serverItems.length > 0;

  // ============================================
  // Unsaved Changes Warning
  // ============================================

  // Only warn about unsaved changes when in edit mode with actual changes
  const shouldWarnAboutChanges = isEditMode && hasChanges;
  const { isBlocked, confirmNavigation, cancelNavigation } =
    useUnsavedChangesWarning(shouldWarnAboutChanges);

  // Track if we're in the process of saving before navigation
  const [isSavingForNavigation, setIsSavingForNavigation] = useState(false);

  // Handle "Discard Changes" - exit edit mode and proceed with navigation
  const handleDiscardAndNavigate = useCallback(() => {
    // Revoke any pending image preview URLs to prevent memory leaks
    pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    // Clear all local state
    setLocalSections([]);
    setLocalItems([]);
    setItemChanges(new Map());
    setNewItemIds(new Set());
    setDeletedItemIds(new Set());
    setSectionChanges(new Map());
    setNewSectionIds(new Set());
    setDeletedSectionIds(new Set());
    setPendingImages(new Map());
    setPendingImageDeletes(new Set());
    setEditingCell(null);
    setIsEditMode(false);
    // Proceed with navigation
    confirmNavigation();
  }, [confirmNavigation, pendingImages]);

  // Handle "Save & Leave" - save changes then proceed with navigation
  const handleSaveAndNavigate = useCallback(async () => {
    if (!onSave || !projectId) {
      // No save handler, just navigate
      confirmNavigation();
      return;
    }

    setIsSavingForNavigation(true);

    // Build batch changes (same logic as handleSave)
    const changes: BatchChanges = {
      itemUpdates: [],
      itemCreates: [],
      itemDeletes: [],
      sectionUpdates: [],
      sectionCreates: [],
      sectionDeletes: [],
    };

    // Collect item updates (excluding new items)
    itemChanges.forEach((itemChange, id) => {
      if (!newItemIds.has(id)) {
        changes.itemUpdates.push({ id, changes: itemChange });
      }
    });

    // Collect new items
    newItemIds.forEach((tempId) => {
      const item = localItems.find((i) => i.id === tempId);
      if (item) {
        const { id, ...rest } = item;
        changes.itemCreates.push({ ...rest, tempId: id });
      }
    });

    // Collect deleted items (excluding new items that were deleted)
    deletedItemIds.forEach((id) => {
      if (!newItemIds.has(id)) {
        changes.itemDeletes.push(id);
      }
    });

    // Collect section updates (excluding new sections)
    sectionChanges.forEach((sectionChange, id) => {
      if (!newSectionIds.has(id)) {
        changes.sectionUpdates.push({ id, changes: sectionChange });
      }
    });

    // Collect new sections
    newSectionIds.forEach((tempId) => {
      const section = localSections.find((s) => s.id === tempId);
      if (section) {
        const { id, ...rest } = section;
        changes.sectionCreates.push({ ...rest, tempId: id });
      }
    });

    // Collect deleted sections (excluding new sections that were deleted)
    deletedSectionIds.forEach((id) => {
      if (!newSectionIds.has(id)) {
        changes.sectionDeletes.push(id);
      }
    });

    try {
      // 1. Save BOQ items/sections first
      const saveResult = await onSave(changes);

      // 2. Upload pending images
      if (pendingImages.size > 0) {
        const imageUploads: Promise<void>[] = [];

        pendingImages.forEach((pending, itemId) => {
          let realItemId = itemId;
          if (newItemIds.has(itemId) && saveResult?.itemIdMap) {
            const mappedId = saveResult.itemIdMap.get(itemId);
            if (mappedId) {
              realItemId = mappedId;
            }
          }

          if (realItemId && !realItemId.startsWith('temp-')) {
            imageUploads.push(
              uploadBOQItemImage(projectId, realItemId, pending.file)
                .then(() => {
                  URL.revokeObjectURL(pending.previewUrl);
                })
                .catch((err) => {
                  console.error(`Failed to upload image for item ${realItemId}:`, err);
                })
            );
          }
        });

        await Promise.allSettled(imageUploads);
      }

      // Clear local state (including pending images)
      pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setLocalSections([]);
      setLocalItems([]);
      setItemChanges(new Map());
      setNewItemIds(new Set());
      setDeletedItemIds(new Set());
      setSectionChanges(new Map());
      setNewSectionIds(new Set());
      setDeletedSectionIds(new Set());
      setPendingImages(new Map());
      setPendingImageDeletes(new Set());
      setEditingCell(null);
      setIsEditMode(false);
      // Proceed with navigation
      confirmNavigation();
    } catch {
      // Stay on page if save fails - user needs to fix the issue
      cancelNavigation();
    } finally {
      setIsSavingForNavigation(false);
    }
  }, [
    onSave,
    projectId,
    localItems,
    localSections,
    itemChanges,
    newItemIds,
    deletedItemIds,
    sectionChanges,
    newSectionIds,
    deletedSectionIds,
    pendingImages,
    confirmNavigation,
    cancelNavigation,
  ]);

  // ============================================
  // Edit Mode Handlers
  // ============================================

  const handleStartEdit = useCallback(() => {
    // Clone server data to local state
    setLocalSections([...serverSections]);
    setLocalItems([...serverItems]);
    // Clear any previous changes
    setItemChanges(new Map());
    setNewItemIds(new Set());
    setDeletedItemIds(new Set());
    setSectionChanges(new Map());
    setNewSectionIds(new Set());
    setDeletedSectionIds(new Set());
    // Enter edit mode
    setIsEditMode(true);
  }, [serverSections, serverItems]);

  const handleCancelEdit = useCallback(() => {
    // Revoke any pending image preview URLs to prevent memory leaks
    pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    // Discard all local changes
    setLocalSections([]);
    setLocalItems([]);
    setItemChanges(new Map());
    setNewItemIds(new Set());
    setDeletedItemIds(new Set());
    setSectionChanges(new Map());
    setNewSectionIds(new Set());
    setDeletedSectionIds(new Set());
    setPendingImages(new Map());
    setPendingImageDeletes(new Set());
    setEditingCell(null);
    // Exit edit mode
    setIsEditMode(false);
  }, [pendingImages]);

  const handleSave = useCallback(async () => {
    if (!onSave || !projectId) return;

    // Build batch changes
    const changes: BatchChanges = {
      itemUpdates: [],
      itemCreates: [],
      itemDeletes: [],
      sectionUpdates: [],
      sectionCreates: [],
      sectionDeletes: [],
    };

    // Collect item updates (excluding new items)
    itemChanges.forEach((itemChange, id) => {
      if (!newItemIds.has(id)) {
        changes.itemUpdates.push({ id, changes: itemChange });
      }
    });

    // Collect new items
    newItemIds.forEach((tempId) => {
      const item = localItems.find((i) => i.id === tempId);
      if (item) {
        const { id, ...rest } = item;
        changes.itemCreates.push({ ...rest, tempId: id });
      }
    });

    // Collect deleted items (excluding new items that were deleted)
    deletedItemIds.forEach((id) => {
      if (!newItemIds.has(id)) {
        changes.itemDeletes.push(id);
      }
    });

    // Collect section updates (excluding new sections)
    sectionChanges.forEach((sectionChange, id) => {
      if (!newSectionIds.has(id)) {
        changes.sectionUpdates.push({ id, changes: sectionChange });
      }
    });

    // Collect new sections
    newSectionIds.forEach((tempId) => {
      const section = localSections.find((s) => s.id === tempId);
      if (section) {
        const { id, ...rest } = section;
        changes.sectionCreates.push({ ...rest, tempId: id });
      }
    });

    // Collect deleted sections (excluding new sections that were deleted)
    deletedSectionIds.forEach((id) => {
      if (!newSectionIds.has(id)) {
        changes.sectionDeletes.push(id);
      }
    });

    try {
      // 1. Save BOQ items/sections first
      const saveResult = await onSave(changes);

      // 2. Upload pending images
      if (pendingImages.size > 0) {
        const imageUploads: Promise<void>[] = [];

        pendingImages.forEach((pending, itemId) => {
          // Resolve temp ID to real ID if this is a new item
          let realItemId = itemId;
          if (newItemIds.has(itemId) && saveResult?.itemIdMap) {
            const mappedId = saveResult.itemIdMap.get(itemId);
            if (mappedId) {
              realItemId = mappedId;
            }
          }

          // Only upload if we have a valid real ID
          if (realItemId && !realItemId.startsWith('temp-')) {
            imageUploads.push(
              uploadBOQItemImage(projectId, realItemId, pending.file)
                .then(() => {
                  // Clean up preview URL
                  URL.revokeObjectURL(pending.previewUrl);
                })
                .catch((err) => {
                  console.error(`Failed to upload image for item ${realItemId}:`, err);
                  toast.error('Failed to upload image', {
                    description: `Could not upload image for one of the items.`,
                  });
                })
            );
          }
        });

        await Promise.allSettled(imageUploads);
      }

      // 3. Delete images marked for deletion
      if (pendingImageDeletes.size > 0) {
        // We need to get the image IDs for items marked for deletion
        // For now, we'll need to handle this differently - the delete needs the image ID
        // This will be handled when we refactor to track image IDs
        // TODO: Implement image deletion tracking
      }

      // Clear local state and exit edit mode
      handleCancelEdit();
    } catch {
      // Stay in edit mode if save fails
    }
  }, [
    onSave,
    projectId,
    localItems,
    localSections,
    itemChanges,
    newItemIds,
    deletedItemIds,
    sectionChanges,
    newSectionIds,
    deletedSectionIds,
    pendingImages,
    pendingImageDeletes,
    handleCancelEdit,
  ]);

  // ============================================
  // Section Handlers
  // ============================================

  const handleToggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const handleAddSection = useCallback(() => {
    if (!isEditMode) return;

    const tempId = generateTempId();
    const newSection: BOQBuilderSection = {
      id: tempId,
      name: 'New Section',
      sortOrder: localSections.length,
    };

    setLocalSections((prev) => [...prev, newSection]);
    setNewSectionIds((prev) => new Set(prev).add(tempId));
    setExpandedSections((prev) => new Set(prev).add(tempId));
  }, [isEditMode, localSections.length]);

  const handleUpdateSection = useCallback(
    (id: string, name: string) => {
      if (!isEditMode) return;

      setLocalSections((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));

      // Track change
      setSectionChanges((prev) => {
        const next = new Map(prev);
        const existing = next.get(id) || {};
        next.set(id, { ...existing, name });
        return next;
      });
    },
    [isEditMode]
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (!isEditMode) return;

      // Remove section from local state
      setLocalSections((prev) => prev.filter((s) => s.id !== sectionId));

      // Move items from this section to unassigned
      setLocalItems((prev) =>
        prev.map((item) => (item.sectionId === sectionId ? { ...item, sectionId: null } : item))
      );

      // Track deletion
      setDeletedSectionIds((prev) => new Set(prev).add(sectionId));

      // Remove from expanded
      setExpandedSections((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    },
    [isEditMode]
  );

  // ============================================
  // Item Handlers
  // ============================================

  const handleCellEdit = useCallback(
    (rowIndex: number, columnKey: string, sectionId: string | null = null) => {
      if (!isEditMode) return;
      setEditingCell({ rowIndex, columnKey, sectionId });
    },
    [isEditMode]
  );

  const handleCellChange = useCallback(
    (itemId: string, field: string, value: string) => {
      if (!isEditMode) return;

      // Parse numeric values
      let parsedValue: string | number = value;
      if (field === 'quantity' || field === 'rate') {
        parsedValue = parseFloat(value) || 0;
      }

      // Update local item
      setLocalItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, [field]: parsedValue } : item))
      );

      // Track change
      setItemChanges((prev) => {
        const next = new Map(prev);
        const existing = next.get(itemId) || {};
        next.set(itemId, { ...existing, [field]: parsedValue });
        return next;
      });
    },
    [isEditMode]
  );

  const handleCellBlur = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleAddItem = useCallback(
    (sectionId: string | null) => {
      if (!isEditMode) return;

      const tempId = generateTempId();
      const newItem: BOQBuilderItem = {
        id: tempId,
        sectionId,
        code: null,
        description: '',
        unit: 'nos',
        quantity: 0,
        rate: 0,
        isReviewFlagged: false,
      };

      setLocalItems((prev) => [...prev, newItem]);
      setNewItemIds((prev) => new Set(prev).add(tempId));

      // Start editing the description cell
      const sectionItems = itemsBySection.get(sectionId) || [];
      setEditingCell({
        rowIndex: sectionItems.length,
        columnKey: 'description',
        sectionId,
      });
    },
    [isEditMode, itemsBySection]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      if (!isEditMode) return;

      setLocalItems((prev) => prev.filter((item) => item.id !== itemId));
      setDeletedItemIds((prev) => new Set(prev).add(itemId));
      setEditingCell(null);
    },
    [isEditMode]
  );

  // ============================================
  // Keyboard Navigation
  // ============================================

  const getKeyboardHandler = (sectionId: string | null) => {
    const sectionItems = itemsBySection.get(sectionId) || [];

    return (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnKey: string) => {
      if (!isEditMode) return;

      const editableColumns = columns.filter((col) => col.isEditable);
      const currentColIndex = editableColumns.findIndex((col) => col.key === columnKey);

      switch (e.key) {
        case 'Tab': {
          e.preventDefault();
          if (e.shiftKey) {
            if (currentColIndex > 0) {
              setEditingCell({
                rowIndex,
                columnKey: editableColumns[currentColIndex - 1].key,
                sectionId,
              });
            } else if (rowIndex > 0) {
              setEditingCell({
                rowIndex: rowIndex - 1,
                columnKey: editableColumns[editableColumns.length - 1].key,
                sectionId,
              });
            }
          } else {
            if (currentColIndex < editableColumns.length - 1) {
              setEditingCell({
                rowIndex,
                columnKey: editableColumns[currentColIndex + 1].key,
                sectionId,
              });
            } else if (rowIndex < sectionItems.length - 1) {
              setEditingCell({
                rowIndex: rowIndex + 1,
                columnKey: editableColumns[0].key,
                sectionId,
              });
            } else {
              // At last cell of last row - add new item
              handleAddItem(sectionId);
            }
          }
          break;
        }

        case 'Enter': {
          e.preventDefault();
          if (e.shiftKey) {
            if (rowIndex > 0) {
              setEditingCell({ rowIndex: rowIndex - 1, columnKey, sectionId });
            }
          } else {
            if (rowIndex < sectionItems.length - 1) {
              setEditingCell({ rowIndex: rowIndex + 1, columnKey, sectionId });
            } else {
              handleCellBlur();
            }
          }
          break;
        }

        case 'Escape': {
          e.preventDefault();
          setEditingCell(null);
          break;
        }
      }
    };
  };

  // ============================================
  // Image Handlers
  // ============================================

  /**
   * Handle image selection - store in pending state until save
   */
  const handleImageSelect = useCallback((itemId: string, file: File) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setPendingImages((prev) => {
      // Revoke old preview URL if exists
      const existing = prev.get(itemId);
      if (existing) {
        URL.revokeObjectURL(existing.previewUrl);
      }

      const next = new Map(prev);
      next.set(itemId, { file, previewUrl });
      return next;
    });

    // Remove from deletes if it was marked for deletion
    setPendingImageDeletes((prev) => {
      if (prev.has(itemId)) {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      }
      return prev;
    });
  }, []);

  /**
   * Handle removing a pending image (not yet saved)
   */
  const handlePendingImageRemove = useCallback((itemId: string) => {
    setPendingImages((prev) => {
      const existing = prev.get(itemId);
      if (existing) {
        URL.revokeObjectURL(existing.previewUrl);
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      }
      return prev;
    });
  }, []);

  /**
   * Handle marking an existing image for deletion (will delete on save)
   */
  const handleExistingImageDelete = useCallback((itemId: string) => {
    setPendingImageDeletes((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }, []);

  /**
   * Get pending image for an item
   */
  const getPendingImage = useCallback(
    (itemId: string): PendingImage | undefined => {
      return pendingImages.get(itemId);
    },
    [pendingImages]
  );

  /**
   * Check if an image is marked for deletion
   */
  const isImageMarkedForDelete = useCallback(
    (itemId: string): boolean => {
      return pendingImageDeletes.has(itemId);
    },
    [pendingImageDeletes]
  );

  // ============================================
  // Effects
  // ============================================

  // Expand new sections when server data changes
  useEffect(() => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      serverSections.forEach((s) => {
        if (!next.has(s.id)) {
          next.add(s.id);
        }
      });
      return next;
    });
  }, [serverSections]);

  // ============================================
  // Render
  // ============================================

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="boq-builder flex flex-col">
      {/* Header */}
      <BOQHeader
        grandTotal={grandTotal}
        itemCount={items.length}
        sectionCount={sections.length}
        hasExistingBOQ={hasExistingBOQ}
        isEditMode={isEditMode}
        hasChanges={hasChanges}
        isSaving={isSaving}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSave={handleSave}
        onAddSection={handleAddSection}
        onImport={onImport || (() => {})}
        onExport={() => {}}
      />

      {/* Table Container with border */}
      <div className="boq-table rounded-lg border border-border overflow-hidden">
        {/* Column Headers */}
        <div className="boq-header flex border-b border-border bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(
                'px-2 py-2',
                col.align === 'right' && 'text-right',
                col.align === 'center' && 'text-center'
              )}
              style={{
                width: col.width === '1fr' ? undefined : col.width,
                minWidth: col.width === '1fr' ? undefined : col.width,
                flex: col.width === '1fr' ? 1 : undefined,
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Body - Sections and Items */}
        <div className="boq-body">
          {sections.length === 0 && items.length === 0 ? (
            // Empty state
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Files weight="duotone" className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No BOQ data yet</EmptyTitle>
                <EmptyDescription>
                  {isEditMode
                    ? 'Add sections and items to build your Bill of Quantities.'
                    : 'Import a BOQ file or start editing to add items manually.'}
                </EmptyDescription>
              </EmptyHeader>
              {!isEditMode && (
                <EmptyContent>
                  <Button
                    variant="outline"
                    onClick={onImport}
                    disabled={hasExistingBOQ}
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import BOQ File
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <>
              {sections.map((section) => {
                const sectionItems = itemsBySection.get(section.id) || [];
                const sectionTotal = sectionTotals.get(section.id) || 0;
                const isExpanded = expandedSections.has(section.id);

                return (
                  <div key={section.id}>
                    {/* Section Header */}
                    <BOQSectionRow
                      section={section}
                      isExpanded={isExpanded}
                      isEditMode={isEditMode}
                      totalAmount={sectionTotal}
                      itemCount={sectionItems.length}
                      onToggle={() => handleToggleSection(section.id)}
                      onRename={(name) => handleUpdateSection(section.id, name)}
                      onDelete={() => handleDeleteSection(section.id)}
                    />

                    {/* Items (if expanded) */}
                    {isExpanded && (
                      <>
                        {sectionItems.map((item, idx) => (
                          <BOQItemRow
                            key={item.id}
                            projectId={projectId || ''}
                            item={item}
                            columns={columns}
                            rowIndex={idx}
                            editingCell={editingCell?.sectionId === section.id ? editingCell : null}
                            isEditMode={isEditMode}
                            onCellEdit={(rowIndex, colKey) =>
                              handleCellEdit(rowIndex, colKey, section.id)
                            }
                            onCellChange={handleCellChange}
                            onCellBlur={handleCellBlur}
                            onDelete={handleDeleteItem}
                            onKeyDown={getKeyboardHandler(section.id)}
                            pendingImage={getPendingImage(item.id)}
                            isImageMarkedForDelete={isImageMarkedForDelete(item.id)}
                            onImageSelect={(file) => handleImageSelect(item.id, file)}
                            onPendingImageRemove={() => handlePendingImageRemove(item.id)}
                            onExistingImageDelete={() => handleExistingImageDelete(item.id)}
                          />
                        ))}

                        {/* Add Item Row (only in edit mode) */}
                        {isEditMode && (
                          <BOQAddRow
                            sectionId={section.id}
                            columns={columns}
                            onAdd={handleAddItem}
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {/* Unassigned items (items without a section) */}
              {(() => {
                const unassignedItems = itemsBySection.get(null) || [];
                if (unassignedItems.length > 0) {
                  return (
                    <div className="border-t border-border">
                      <div className="bg-muted/30 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
                        Unassigned Items ({unassignedItems.length})
                      </div>
                      {unassignedItems.map((item, idx) => (
                        <BOQItemRow
                          key={item.id}
                          projectId={projectId || ''}
                          item={item}
                          columns={columns}
                          rowIndex={idx}
                          editingCell={editingCell?.sectionId === null ? editingCell : null}
                          isEditMode={isEditMode}
                          onCellEdit={(rowIndex, colKey) => handleCellEdit(rowIndex, colKey, null)}
                          onCellChange={handleCellChange}
                          onCellBlur={handleCellBlur}
                          onDelete={handleDeleteItem}
                          onKeyDown={getKeyboardHandler(null)}
                          pendingImage={getPendingImage(item.id)}
                          isImageMarkedForDelete={isImageMarkedForDelete(item.id)}
                          onImageSelect={(file) => handleImageSelect(item.id, file)}
                          onPendingImageRemove={() => handlePendingImageRemove(item.id)}
                          onExistingImageDelete={() => handleExistingImageDelete(item.id)}
                        />
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </>
          )}

          {/* Add Section Row (only in edit mode) */}
          {isEditMode && <BOQAddSectionRow onAdd={handleAddSection} />}
        </div>

        {/* Footer - Grand Total (sticky within table) */}
        <div className="boq-footer flex items-center justify-between border-t border-border bg-muted px-4 py-3 text-sm font-semibold sticky bottom-0">
          <span>GRAND TOTAL</span>
          <span className="tabular-nums text-base">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(grandTotal)}
          </span>
        </div>
      </div>

      {/* Unsaved Changes Warning Dialog */}
      <UnsavedChangesDialog
        isOpen={isBlocked}
        isSaving={isSavingForNavigation}
        onCancel={cancelNavigation}
        onDiscard={handleDiscardAndNavigate}
        onSave={handleSaveAndNavigate}
      />
    </div>
  );
}
