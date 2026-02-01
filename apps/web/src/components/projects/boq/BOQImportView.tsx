/**
 * BOQ Import View
 *
 * In-tab component for importing BOQ from files.
 * Features:
 * - Drag & drop file upload
 * - Real-time progress via WebSocket
 * - Result preview and editing
 * - Confirm/cancel import
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  CloudArrowUp,
  File,
  FilePdf,
  FileXls,
  X,
  CircleNotch,
  CheckCircle,
  Warning,
  ArrowLeft,
  Clock,
  Sparkle,
  Check,
  Trash,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import { useProject } from '@/lib/hooks/useProjects';
import {
  useStartImport,
  useConfirmImport,
  useCancelImport,
  useImportJobStatus,
} from '@/lib/hooks/useImports';
import { useImportWebSocket } from '@/lib/hooks/useImportWebSocket';
import { useImportsStore, getStatusLabel } from '@/stores/imports.store';

// ============================================
// Constants
// ============================================

// Maximum file size for AI processing (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Maximum time allowed for parsing (5 minutes)
const PARSE_TIMEOUT_SECONDS = 300; // 5 minutes

// ============================================
// Types
// ============================================

interface ParsedItem {
  code?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  sectionName?: string;
  isReviewRequired?: boolean;
  reviewReason?: string;
}

interface BOQImportViewProps {
  projectId: string;
  projectName?: string;
  onBack: () => void;
}

// ============================================
// Helper Functions
// ============================================

function getFileIcon(fileName: string) {
  const ext = fileName.toLowerCase().split('.').pop();
  if (ext === 'pdf') return FilePdf;
  return FileXls;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// Component
// ============================================

export function BOQImportView({ projectId, projectName, onBack }: BOQImportViewProps) {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Queries & Mutations
  const { data: project } = useProject(projectId);
  const startImport = useStartImport();
  const confirmImport = useConfirmImport();
  const cancelImport = useCancelImport();
  const { data: jobData } = useImportJobStatus(projectId, currentJobId || '');

  // WebSocket for real-time updates
  useImportWebSocket();

  // Get job from store (updated via WebSocket)
  const jobFromStore = useImportsStore((state) =>
    currentJobId ? state.getJob(currentJobId) : undefined
  );

  // Use store data if available, fallback to query data
  const job = jobFromStore || jobData;

  // Initialize selected items when result is available
  useEffect(() => {
    if (job?.result && typeof job.result === 'object') {
      const result = job.result as { items?: ParsedItem[] };
      if (result.items) {
        // Select all items by default
        setSelectedItems(new Set(result.items.map((_, i) => i)));
      }
    }
  }, [job?.result]);

  // Track elapsed time and auto-timeout during processing
  useEffect(() => {
    const isProcessing = job && !['COMPLETED', 'FAILED'].includes(job.status);

    if (isProcessing && currentJobId) {
      // Start elapsed time timer
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      // Set up 5-minute timeout
      timeoutRef.current = setTimeout(async () => {
        // Auto-cancel after timeout
        try {
          await cancelImport.mutateAsync({ projectId, jobId: currentJobId });
        } catch {
          // Ignore errors on auto-cancel
        }
        toast.error('Import timed out', {
          description: `The import took longer than ${PARSE_TIMEOUT_SECONDS / 60} minutes. Please try with a smaller file.`,
        });
      }, PARSE_TIMEOUT_SECONDS * 1000);
    } else {
      // Clear timers when not processing
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [job?.status, currentJobId, cancelImport, projectId]);

  // ============================================
  // File Handling
  // ============================================

  const handleFileSelect = useCallback((file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();
    const validExtensions = ['xlsx', 'xls', 'csv', 'pdf'];

    if (!ext || !validExtensions.includes(ext)) {
      toast.error('Invalid file type', {
        description: `Supported formats: ${validExtensions.join(', ')}`,
      });
      return;
    }

    // Check file size limit (10MB)
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', {
        description: `Maximum file size is 10MB. Your file is ${formatFileSize(file.size)}.`,
      });
      return;
    }

    setSelectedFile(file);
    setCurrentJobId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setCurrentJobId(null);
    setElapsedTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // ============================================
  // Import Actions
  // ============================================

  const handleStartImport = async () => {
    if (!selectedFile || !projectId) return;

    try {
      const result = await startImport.mutateAsync({
        projectId,
        file: selectedFile,
        projectName: project?.name || projectName,
      });
      setCurrentJobId(result.jobId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleConfirmImport = async () => {
    if (!job?.result || !projectId || !currentJobId) return;

    const result = job.result as { items?: ParsedItem[] };
    if (!result.items) return;

    // Get selected items
    const itemsToSave = result.items.filter((_, i) => selectedItems.has(i));

    if (itemsToSave.length === 0) {
      toast.error('No items selected', {
        description: 'Please select at least one item to import.',
      });
      return;
    }

    try {
      await confirmImport.mutateAsync({
        projectId,
        jobId: currentJobId,
        items: itemsToSave.map((item) => ({
          code: item.code,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          sectionName: item.sectionName,
        })),
      });

      // Return to BOQ Builder
      onBack();
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancelImport = async () => {
    if (!projectId || !currentJobId) return;

    try {
      await cancelImport.mutateAsync({ projectId, jobId: currentJobId });
      clearFile();
    } catch {
      // Error handled by mutation
    }
  };

  // ============================================
  // Item Selection
  // ============================================

  const toggleItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const toggleAll = () => {
    const result = job?.result as { items?: ParsedItem[] };
    if (!result?.items) return;

    if (selectedItems.size === result.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(result.items.map((_, i) => i)));
    }
  };

  // ============================================
  // Render States
  // ============================================

  const parsedResult = job?.result as { items?: ParsedItem[]; sections?: string[] } | null;
  const isProcessing = job && !['COMPLETED', 'FAILED'].includes(job.status);
  const isCompleted = job?.status === 'COMPLETED';
  const isFailed = job?.status === 'FAILED';

  const FileIcon = selectedFile ? getFileIcon(selectedFile.name) : File;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Import BOQ</h2>
            <p className="text-sm text-muted-foreground">
              Upload an Excel, CSV, or PDF file to import Bill of Quantities items.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {!currentJobId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudArrowUp className="h-5 w-5" />
              Upload File
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Dropzone */}
            <div
              className={cn(
                'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                selectedFile && 'border-solid border-primary/50 bg-primary/5'
              )}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <FileIcon className="h-12 w-12 text-primary" weight="duotone" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <CloudArrowUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">
                    Drop your file here, or{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-primary hover:underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Supports Excel (.xlsx, .xls), CSV, and PDF files up to 10MB
                  </p>
                </>
              )}
            </div>

            {/* Start Button */}
            {selectedFile && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleStartImport}
                  disabled={startImport.isPending}
                  className="min-w-32"
                >
                  {startImport.isPending ? (
                    <>
                      <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Sparkle className="mr-2 h-4 w-4" />
                      Start Import
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing State */}
      {currentJobId && isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleNotch className="h-5 w-5 animate-spin text-primary" />
              Processing Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <FileIcon className="h-10 w-10 text-primary" weight="duotone" />
                <div>
                  <p className="font-medium">{job?.fileName || selectedFile?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {job?.fileSize ? formatFileSize(job.fileSize) : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{getStatusLabel(job!.status)}</span>
                  <span className="font-medium">{job?.progress || 0}%</span>
                </div>
                <Progress value={job?.progress || 0} className="h-2" />
              </div>

              {job?.itemsFound && (
                <p className="text-sm text-muted-foreground">Found {job.itemsFound} items</p>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {elapsedTime}s elapsed • Max {PARSE_TIMEOUT_SECONDS / 60} min
                  </span>
                </div>
              </div>

              {/* Timeout Warning */}
              {elapsedTime > 60 && (
                <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg text-sm text-amber-700">
                  <Warning className="h-4 w-4" />
                  <span>
                    {elapsedTime >= PARSE_TIMEOUT_SECONDS - 60
                      ? `Timing out in ${PARSE_TIMEOUT_SECONDS - elapsedTime}s...`
                      : `Taking longer than expected`}
                  </span>
                </div>
              )}

              {/* Cancel Button */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancelImport}
                  disabled={cancelImport.isPending}
                >
                  {cancelImport.isPending ? (
                    <>
                      <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Import'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed State */}
      {currentJobId && isFailed && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Warning className="h-5 w-5" />
              Import Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {job?.errors && job.errors.length > 0 && (
                <div className="rounded-md bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">{job.errors.join('. ')}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFile}>
                  Try Again
                </Button>
                <Button variant="ghost" onClick={onBack}>
                  Back to BOQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed State - Review Items */}
      {currentJobId && isCompleted && parsedResult?.items && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Import Complete
                </CardTitle>
                <Badge variant="secondary">{parsedResult.items.length} items found</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review the extracted items below and select which ones to import. You can deselect
                items you don&apos;t want to include.
              </p>

              {parsedResult.sections && parsedResult.sections.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Sections:</span>
                  {parsedResult.sections.map((section) => (
                    <Badge key={section} variant="outline">
                      {section}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Review Items</CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size} of {parsedResult.items.length} selected
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedItems.size === parsedResult.items.length}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead className="w-20">Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Unit</TableHead>
                      <TableHead className="w-24 text-right">Qty</TableHead>
                      <TableHead className="w-28 text-right">Rate</TableHead>
                      <TableHead className="w-32 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedResult.items.map((item, index) => (
                      <TableRow
                        key={index}
                        className={cn(
                          item.isReviewRequired && 'bg-yellow-50 dark:bg-yellow-900/10',
                          !selectedItems.has(index) && 'opacity-50'
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(index)}
                            onCheckedChange={() => toggleItem(index)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.code || '-'}</TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="truncate">{item.description}</p>
                            {item.sectionName && (
                              <p className="text-xs text-muted-foreground">{item.sectionName}</p>
                            )}
                            {item.isReviewRequired && (
                              <p className="text-xs text-yellow-600">⚠ {item.reviewReason}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.quantity * item.rate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <p className="font-medium">
                Total:{' '}
                {formatCurrency(
                  parsedResult.items
                    .filter((_, i) => selectedItems.has(i))
                    .reduce((sum, item) => sum + item.quantity * item.rate, 0)
                )}
              </p>
              <p className="text-sm text-muted-foreground">{selectedItems.size} items selected</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancelImport}
                disabled={cancelImport.isPending}
              >
                <Trash className="mr-2 h-4 w-4" />
                Discard
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={confirmImport.isPending || selectedItems.size === 0}
              >
                {confirmImport.isPending ? (
                  <>
                    <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Import ({selectedItems.size} items)
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
