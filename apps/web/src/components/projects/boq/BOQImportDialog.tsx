/**
 * BOQ Import Dialog
 *
 * Modal for importing BOQ from Excel/CSV/PDF files with AI parsing.
 * Features:
 * - Drag & drop file upload
 * - PDF support with AI extraction
 * - Estimated time display
 * - Granular progress states
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
  Info,
  Clock,
  Sparkle,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { parseBOQFile, type ParseResult } from '@/lib/api/boq';
import { cn } from '@/lib/utils';

// ============================================
// Constants
// ============================================

// Maximum file size for AI processing (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Maximum time allowed for parsing (5 minutes)
const PARSE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const PARSE_TIMEOUT_SECONDS = 300;

// ============================================
// Types
// ============================================

interface BOQImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onParseComplete: (result: ParseResult) => void;
}

type ImportStep = 'upload' | 'parsing' | 'error';

interface ParseStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}

// ============================================
// Helper Functions
// ============================================

function getFileIcon(fileName: string) {
  const ext = fileName.toLowerCase().split('.').pop();
  if (ext === 'pdf') {
    return FilePdf;
  }
  return FileXls;
}

function getFileType(fileName: string): 'pdf' | 'excel' | 'csv' {
  const ext = fileName.toLowerCase().split('.').pop();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'csv') return 'csv';
  return 'excel';
}

function getEstimatedTime(file: File): { min: number; max: number } {
  const fileType = getFileType(file.name);
  const sizeMB = file.size / (1024 * 1024);

  if (fileType === 'pdf') {
    // PDF requires AI processing - slower
    if (sizeMB < 1) return { min: 15, max: 30 };
    if (sizeMB < 5) return { min: 20, max: 45 };
    return { min: 30, max: 60 };
  }

  // Excel/CSV - faster
  if (sizeMB < 0.5) return { min: 5, max: 15 };
  if (sizeMB < 2) return { min: 10, max: 25 };
  return { min: 15, max: 40 };
}

function formatEstimatedTime(estimate: { min: number; max: number }): string {
  if (estimate.min === estimate.max) {
    return `~${estimate.min} seconds`;
  }
  return `~${estimate.min}-${estimate.max} seconds`;
}

// ============================================
// Component
// ============================================

export function BOQImportDialog({
  open,
  onOpenChange,
  projectId,
  onParseComplete,
}: BOQImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [parseStages, setParseStages] = useState<ParseStage[]>([
    { id: 'upload', label: 'Document uploaded', status: 'pending' },
    { id: 'extract', label: 'Extracting content', status: 'pending' },
    { id: 'analyze', label: 'AI analyzing structure', status: 'pending' },
    { id: 'map', label: 'Mapping categories', status: 'pending' },
    { id: 'validate', label: 'Validating data', status: 'pending' },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Cleanup timers and abort controller on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset state when dialog closes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        // Abort any in-progress parsing
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
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
        // Reset state
        setStep('upload');
        setSelectedFile(null);
        setParseProgress(0);
        setParseStatus('');
        setErrorMessage('');
        setElapsedTime(0);
        setIsParsing(false);
        setParseStages((prev) => prev.map((s) => ({ ...s, status: 'pending' })));
      }
      onOpenChange(open);
    },
    [onOpenChange]
  );

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/pdf',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv', '.pdf'];

    const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      toast.error('Please upload an Excel (.xlsx, .xls), CSV, or PDF file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  }, []);

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Update parse stage
  const updateStage = useCallback((stageId: string, status: ParseStage['status']) => {
    setParseStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, status } : s)));
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    // Abort any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
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
    // Show cancellation message
    setIsParsing(false);
    setStep('error');
    setErrorMessage('Import was cancelled');
  }, []);

  // Handle parse
  const handleParse = useCallback(async () => {
    if (!selectedFile) return;

    setStep('parsing');
    setParseProgress(0);
    setParseStatus('Preparing document...');
    setElapsedTime(0);
    setIsParsing(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Start elapsed time timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Set up 5-minute timeout
    timeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsParsing(false);
      setStep('error');
      setErrorMessage(
        `Import timed out after ${PARSE_TIMEOUT_SECONDS / 60} minutes. Please try with a smaller file or simpler format.`
      );
    }, PARSE_TIMEOUT_MS);

    // Stage 1: Upload complete
    updateStage('upload', 'complete');
    setParseProgress(10);

    // Stage 2: Extracting content
    updateStage('extract', 'active');
    setParseStatus('Extracting content from document...');

    // Simulate progress for UX (actual parsing is async)
    const progressInterval = setInterval(() => {
      setParseProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return prev;
        }
        // Slow down as we progress
        const increment = prev < 50 ? 5 : prev < 70 ? 3 : 1;
        return prev + increment;
      });
    }, 500);

    // Update stages based on progress
    setTimeout(() => {
      updateStage('extract', 'complete');
      updateStage('analyze', 'active');
      setParseStatus('AI is analyzing your BOQ structure...');
    }, 2000);

    setTimeout(() => {
      updateStage('analyze', 'complete');
      updateStage('map', 'active');
      setParseStatus('Matching items to your work categories...');
    }, 5000);

    setTimeout(() => {
      updateStage('map', 'complete');
      updateStage('validate', 'active');
      setParseStatus('Validating totals and flagging issues...');
    }, 8000);

    try {
      const result = await parseBOQFile(projectId, selectedFile, abortControllerRef.current.signal);

      // Clear timers on success
      clearInterval(progressInterval);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Defense in depth: even if API returns 200, verify we have items
      if (result.items.length === 0) {
        const errorMsg =
          result.errors?.length > 0
            ? result.errors.join('. ')
            : 'No items found in the file. Please check the file format and try again.';
        throw new Error(errorMsg);
      }

      // Complete all stages
      setParseStages((prev) => prev.map((s) => ({ ...s, status: 'complete' })));
      setParseProgress(100);
      setParseStatus('Complete!');
      setIsParsing(false);

      // Small delay to show completion
      setTimeout(() => {
        onParseComplete(result);
        handleOpenChange(false);
      }, 500);
    } catch (error) {
      // Clear timers on error
      clearInterval(progressInterval);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setIsParsing(false);

      // Handle different error types
      if (error instanceof Error) {
        // Check if this was an abort (user cancelled or timeout)
        if (error.name === 'AbortError' || error.message.includes('canceled')) {
          // Don't show error for user-initiated cancel (already handled)
          if (step !== 'error') {
            setStep('error');
            setErrorMessage('Import was cancelled');
          }
          return;
        }
        setStep('error');
        setErrorMessage(error.message);
      } else {
        setStep('error');
        setErrorMessage('Failed to parse file');
      }
    }
  }, [selectedFile, projectId, onParseComplete, handleOpenChange, updateStage, step]);

  // Clear selected file
  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const FileIcon = selectedFile ? getFileIcon(selectedFile.name) : File;
  const fileType = selectedFile ? getFileType(selectedFile.name) : null;
  const estimatedTime = selectedFile ? getEstimatedTime(selectedFile) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="h-5 w-5 text-primary" />
            AI-Powered BOQ Import
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                'hover:border-primary hover:bg-muted/50',
                selectedFile ? 'border-primary bg-muted/30' : 'border-muted-foreground/30'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileIcon
                    className={cn(
                      'h-8 w-8',
                      fileType === 'pdf' ? 'text-red-500' : 'text-green-600'
                    )}
                  />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearFile();
                    }}
                    className="ml-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <CloudArrowUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Drop your BOQ file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, Excel (.xlsx), CSV • Max 10MB
                  </p>
                </>
              )}
            </div>

            {/* Estimated Time */}
            {selectedFile && estimatedTime && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Estimated time:{' '}
                  <span className="font-medium">{formatEstimatedTime(estimatedTime)}</span>
                </span>
                {fileType === 'pdf' && (
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <Sparkle className="h-3 w-3" />
                    AI-powered
                  </span>
                )}
              </div>
            )}

            {/* How It Works */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Info className="h-4 w-4" />
                How It Works
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-xs font-medium shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Upload your BOQ file</p>
                    <p className="text-muted-foreground">Supported: PDF, Excel, or CSV</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-xs font-medium shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium">AI extracts & maps items</p>
                    <p className="text-muted-foreground">
                      Intelligent parsing with category suggestions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-xs font-medium shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Review with confidence scores</p>
                    <p className="text-muted-foreground">See AI confidence, edit before saving</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Numbers are preserved exactly as in your document
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleParse}
                disabled={!selectedFile || isParsing}
                className="cursor-pointer"
              >
                {isParsing ? 'Processing...' : 'Parse File'}
              </Button>
            </div>
          </div>
        )}

        {step === 'parsing' && (
          <div className="space-y-4 py-4">
            {/* File Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileIcon
                className={cn('h-8 w-8', fileType === 'pdf' ? 'text-red-500' : 'text-green-600')}
              />
              <div className="flex-1">
                <p className="font-medium">{selectedFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{elapsedTime}s elapsed</div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{parseStatus}</span>
                <span>{parseProgress}%</span>
              </div>
              <Progress value={parseProgress} />
            </div>

            {/* Status Items */}
            <div className="space-y-2">
              {parseStages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-2 text-sm">
                  {stage.status === 'complete' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : stage.status === 'active' ? (
                    <CircleNotch className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                  )}
                  <span
                    className={cn(
                      stage.status === 'complete'
                        ? 'text-foreground'
                        : stage.status === 'active'
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeout Warning */}
            {elapsedTime > 60 && (
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg text-sm text-amber-700">
                <Warning className="h-4 w-4" />
                <span>
                  {elapsedTime >= PARSE_TIMEOUT_SECONDS - 60
                    ? `Timing out in ${PARSE_TIMEOUT_SECONDS - elapsedTime}s...`
                    : `Taking longer than expected (max ${PARSE_TIMEOUT_SECONDS / 60} min)`}
                </span>
              </div>
            )}

            {/* Cancel Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCancel} className="cursor-pointer">
                Cancel Import
              </Button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
              <Warning className="h-8 w-8 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Failed to parse file</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setStep('upload');
                  setErrorMessage('');
                }}
                className="cursor-pointer"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
