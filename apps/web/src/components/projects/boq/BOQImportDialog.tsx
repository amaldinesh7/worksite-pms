/**
 * BOQ Import Dialog
 *
 * Modal for importing BOQ from Excel/CSV files.
 */

import { useState, useCallback, useRef } from 'react';
import { CloudArrowUp, File, X, CircleNotch, CheckCircle, Warning, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useParseBOQFile } from '@/lib/hooks/useBOQ';
import type { ParseResult } from '@/lib/api/boq';
import { cn } from '@/lib/utils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseMutation = useParseBOQFile(projectId);

  // Reset state when dialog closes
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setStep('upload');
      setSelectedFile(null);
      setParseProgress(0);
      setParseStatus('');
      setErrorMessage('');
    }
    onOpenChange(open);
  }, [onOpenChange]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];

    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setSelectedFile(file);
  }, []);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Handle parse
  const handleParse = useCallback(async () => {
    if (!selectedFile) return;

    setStep('parsing');
    setParseProgress(0);
    setParseStatus('Processing document...');

    // Simulate progress
    const progressInterval = setInterval(() => {
      setParseProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      setParseStatus('Extracting line items...');
      const result = await parseMutation.mutateAsync(selectedFile);

      clearInterval(progressInterval);
      setParseProgress(100);
      setParseStatus('Complete!');

      // Small delay to show completion
      setTimeout(() => {
        onParseComplete(result);
        handleOpenChange(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse file');
    }
  }, [selectedFile, parseMutation, onParseComplete, handleOpenChange]);

  // Clear selected file
  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import BOQ</DialogTitle>
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
                accept=".xlsx,.xls,.csv"
                onChange={handleInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="h-8 w-8 text-primary" />
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
                    PDF, Excel (.xlsx), CSV • Max 25MB
                  </p>
                </>
              )}
            </div>

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
                    <p className="text-muted-foreground">Supported formats: PDF, Excel, or CSV</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-xs font-medium shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium">AI extracts line items</p>
                    <p className="text-muted-foreground">Our AI reads and structures your data automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-xs font-medium shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium">You review & confirm all items</p>
                    <p className="text-muted-foreground">Check extracted data before adding to your project</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                You'll have full control to edit before saving
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
                disabled={!selectedFile || parseMutation.isPending}
                className="cursor-pointer"
              >
                {parseMutation.isPending ? 'Processing...' : 'Parse File'}
              </Button>
            </div>
          </div>
        )}

        {step === 'parsing' && (
          <div className="space-y-4 py-4">
            {/* File Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <File className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
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
              <div className="flex items-center gap-2 text-sm">
                {parseProgress >= 30 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <CircleNotch className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <span className={parseProgress >= 30 ? 'text-foreground' : 'text-muted-foreground'}>
                  Document structure analyzed
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {parseProgress >= 70 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <CircleNotch className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <span className={parseProgress >= 70 ? 'text-foreground' : 'text-muted-foreground'}>
                  Line items extracted
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {parseProgress >= 100 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <CircleNotch className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <span className={parseProgress >= 100 ? 'text-foreground' : 'text-muted-foreground'}>
                  Ready for review
                </span>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel Parsing
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
