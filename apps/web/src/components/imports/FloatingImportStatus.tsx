/**
 * Floating Import Status Bar
 *
 * Shows active import progress at the bottom of the screen.
 * Persists across navigation and can be minimized.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircleNotch,
  CheckCircle,
  Warning,
  CaretDown,
  CaretUp,
  X,
  FileXls,
  FilePdf,
  Eye,
  Trash,
} from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  useImportsStore,
  getStatusLabel,
  isActiveStatus,
  type ImportJob,
} from '@/stores/imports.store';
import { useImportWebSocket } from '@/lib/hooks/useImportWebSocket';

// ============================================
// Types
// ============================================

interface ImportItemProps {
  job: ImportJob;
  onView: () => void;
  onDismiss: () => void;
}

// ============================================
// Helper Functions
// ============================================

function getFileIcon(fileType: string) {
  if (fileType === 'pdf') return FilePdf;
  return FileXls;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================
// Import Item Component
// ============================================

function ImportItem({ job, onView, onDismiss }: ImportItemProps) {
  const isActive = isActiveStatus(job.status);
  const isCompleted = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';

  const FileIcon = getFileIcon(job.fileType);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all',
        isActive && 'border-primary/30',
        isCompleted && 'border-green-500/30',
        isFailed && 'border-destructive/30'
      )}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {isActive && <CircleNotch className="h-5 w-5 animate-spin text-primary" />}
        {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" weight="fill" />}
        {isFailed && <Warning className="h-5 w-5 text-destructive" weight="fill" />}
      </div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{job.fileName}</span>
          <span className="flex-shrink-0 text-xs text-muted-foreground">
            ({formatFileSize(job.fileSize)})
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{getStatusLabel(job.status)}</span>
          {job.itemsFound && (
            <span className="text-xs text-muted-foreground">• {job.itemsFound} items</span>
          )}
        </div>
        {isActive && <Progress value={job.progress} className="mt-2 h-1" />}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {(isCompleted || isFailed) && (
          <Button variant="ghost" size="sm" onClick={onView} className="h-7 px-2 cursor-pointer">
            <Eye className="h-3.5 w-3.5" />
          </Button>
        )}
        {/* Always show dismiss - with confirmation for active imports */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isActive) {
              if (
                confirm('This import is still in progress. Are you sure you want to dismiss it?')
              ) {
                onDismiss();
              }
            } else {
              onDismiss();
            }
          }}
          className="h-7 w-7 p-0 cursor-pointer"
          title={isActive ? 'Force dismiss' : 'Dismiss'}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function FloatingImportStatus() {
  const navigate = useNavigate();

  // WebSocket connection
  useImportWebSocket();

  // Store state
  const jobs = useImportsStore((state) => state.jobs);
  const isMinimized = useImportsStore((state) => state.isFloatingBarMinimized);
  const isVisible = useImportsStore((state) => state.isFloatingBarVisible);
  const setMinimized = useImportsStore((state) => state.setFloatingBarMinimized);
  const setVisible = useImportsStore((state) => state.setFloatingBarVisible);
  const removeJob = useImportsStore((state) => state.removeJob);

  // Get all jobs (active and recent completed)
  const allJobs = Array.from(jobs.values()).sort((a, b) => {
    // Active jobs first
    const aActive = isActiveStatus(a.status);
    const bActive = isActiveStatus(b.status);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    // Then by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeCount = allJobs.filter((j) => isActiveStatus(j.status)).length;

  const handleView = useCallback(
    (job: ImportJob) => {
      // Navigate to project page - user can access BOQ tab to see import details
      navigate(`/projects/${job.projectId}`);
    },
    [navigate]
  );

  const handleDismiss = useCallback(
    (jobId: string) => {
      removeJob(jobId);
    },
    [removeJob]
  );

  const handleClose = useCallback(() => {
    // If there are active jobs, confirm before closing
    if (activeCount > 0) {
      if (!confirm('There are active imports. Are you sure you want to dismiss all?')) {
        return;
      }
    }
    // Clear all jobs and hide the bar
    allJobs.forEach((job) => {
      removeJob(job.id);
    });
    setVisible(false);
  }, [activeCount, allJobs, removeJob, setVisible]);

  const handleClearCompleted = useCallback(() => {
    allJobs.forEach((job) => {
      if (!isActiveStatus(job.status)) {
        removeJob(job.id);
      }
    });
  }, [allJobs, removeJob]);

  // Don't render if no jobs or hidden
  if (allJobs.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div className={cn('fixed bottom-4 right-4 z-50 w-96 transition-all', isMinimized && 'w-auto')}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between rounded-t-lg border border-b-0 bg-card px-4 py-2',
          isMinimized && 'rounded-lg border-b'
        )}
      >
        <div className="flex items-center gap-2">
          {activeCount > 0 && <CircleNotch className="h-4 w-4 animate-spin text-primary" />}
          <span className="text-sm font-medium">
            {activeCount > 0
              ? `${activeCount} import${activeCount > 1 ? 's' : ''} in progress`
              : `${allJobs.length} import${allJobs.length > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Clear completed button - only show if there are completed jobs */}
          {allJobs.some((j) => !isActiveStatus(j.status)) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCompleted}
              className="h-6 px-2 text-xs cursor-pointer"
              title="Clear completed"
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMinimized(!isMinimized)}
            className="h-6 w-6 p-0 cursor-pointer"
          >
            {isMinimized ? <CaretUp className="h-4 w-4" /> : <CaretDown className="h-4 w-4" />}
          </Button>
          {/* Always show close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 cursor-pointer"
            title="Close all"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="max-h-80 space-y-2 overflow-auto rounded-b-lg border bg-background p-2">
          {allJobs.slice(0, 5).map((job) => (
            <ImportItem
              key={job.id}
              job={job}
              onView={() => handleView(job)}
              onDismiss={() => handleDismiss(job.id)}
            />
          ))}
          {allJobs.length > 5 && (
            <p className="py-1 text-center text-xs text-muted-foreground">
              +{allJobs.length - 5} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
