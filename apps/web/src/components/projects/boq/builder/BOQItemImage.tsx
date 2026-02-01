/**
 * BOQItemImage Component
 *
 * Displays a thumbnail for a BOQ item image with popover preview.
 * Images are selected but NOT uploaded immediately - they are stored
 * in pending state until the parent BOQBuilder saves.
 */

import { useState, useRef, useCallback } from 'react';
import { Image, Plus, Trash2, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBOQItemImages } from '@/lib/hooks/useBOQ';
import type { BOQItemImage as BOQItemImageType } from '@/lib/api/boq';
import type { PendingImage } from './types';

interface BOQItemImageProps {
  projectId: string;
  boqItemId: string;
  isEditing?: boolean;
  isNewItem?: boolean;
  // Pending image state (from parent)
  pendingImage?: PendingImage;
  isMarkedForDelete?: boolean;
  // Callbacks (deferred save)
  onImageSelect?: (file: File) => void;
  onPendingImageRemove?: () => void;
  onExistingImageDelete?: () => void;
}

export function BOQItemImage({
  projectId,
  boqItemId,
  isEditing = false,
  isNewItem = false,
  pendingImage,
  isMarkedForDelete = false,
  onImageSelect,
  onPendingImageRemove,
  onExistingImageDelete,
}: BOQItemImageProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only fetch existing images if it's not a new item
  const { data: images = [], isLoading } = useBOQItemImages(projectId, isNewItem ? '' : boqItemId);

  // Determine what to show:
  // 1. If there's a pending image, show it (local preview)
  // 2. If there's an existing image and not marked for delete, show it
  // 3. Otherwise show empty/add button
  const existingImage = images[0] as BOQItemImageType | undefined;
  const hasExistingImage = existingImage && !isMarkedForDelete;
  const hasPendingImage = !!pendingImage;
  const hasAnyImage = hasPendingImage || hasExistingImage;

  // Get the image to display
  const displayImageUrl = hasPendingImage ? pendingImage.previewUrl : existingImage?.fileUrl;
  const displayFileName = hasPendingImage ? pendingImage.file.name : existingImage?.fileName;

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please select a JPEG, PNG, GIF, or WebP image.',
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Maximum file size is 10MB.',
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleConfirmSelect = useCallback(() => {
    if (!selectedFile || !onImageSelect) return;

    // Pass file to parent (will be uploaded on save)
    onImageSelect(selectedFile);

    // Close dialog and reset local state
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [selectedFile, previewUrl, onImageSelect]);

  const handleRemovePending = useCallback(() => {
    if (onPendingImageRemove) {
      onPendingImageRemove();
      toast.info('Image removed', {
        description: 'Changes will be discarded if you cancel editing.',
      });
    }
  }, [onPendingImageRemove]);

  const handleDeleteExisting = useCallback(() => {
    if (!confirm('Delete this image? It will be removed when you save.')) return;

    if (onExistingImageDelete) {
      onExistingImageDelete();
      toast.info('Image marked for deletion', {
        description: 'Image will be deleted when you save.',
      });
    }
  }, [onExistingImageDelete]);

  const handleDialogClose = useCallback(() => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  if (isLoading && !isNewItem) {
    return (
      <div className="flex h-6 w-6 items-center justify-center">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {hasAnyImage ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative h-6 w-6 cursor-pointer overflow-hidden rounded border border-border bg-muted transition-all hover:ring-2 hover:ring-ring-primary focus:outline-none focus:ring-2 focus:ring-ring-primary"
            >
              <img src={displayImageUrl} alt="BOQ item" className="h-full w-full object-cover" />
              {/* Pending indicator */}
              {hasPendingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="space-y-2">
              <img
                src={displayImageUrl}
                alt="BOQ item preview"
                className="max-h-[300px] max-w-[300px] rounded object-contain"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="max-w-[200px] truncate">{displayFileName}</span>
                {hasPendingImage && <span className="text-xs text-primary">Pending save</span>}
              </div>
              {isEditing && (
                <div className="flex justify-end gap-1">
                  {hasPendingImage ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleRemovePending}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  ) : hasExistingImage ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleDeleteExisting}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ) : isEditing ? (
        <button
          type="button"
          onClick={() => setIsUploadDialogOpen(true)}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
        >
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
      ) : (
        <div className="flex h-6 w-6 items-center justify-center text-muted-foreground/30">
          <Image className="h-3 w-3" />
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Select an image for this BOQ item. It will be uploaded when you save.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mx-auto max-h-[200px] rounded object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-6 w-6"
                  onClick={() => {
                    setSelectedFile(null);
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {selectedFile?.name}
                </p>
              </div>
            ) : (
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click to select an image</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPEG, PNG, GIF, WebP • Max 10MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSelect} disabled={!selectedFile}>
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
