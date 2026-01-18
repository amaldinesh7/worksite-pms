/**
 * Add Expense Modal
 *
 * Modal dialog for creating and editing expenses.
 * Features:
 * - Manual / Scan Invoice tabs
 * - Dynamic fields based on expense type (Material/Labour/Sub Work)
 * - Auto-calculated Total Amount and Balance
 * - Combined file upload for photos and documents
 */

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Money, Bank, CreditCard, CloudArrowUp, FileText } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/custom/date-picker';
import { cn } from '@/lib/utils';
import { useCategoryItems } from '@/lib/hooks/useCategories';
import { useParties } from '@/lib/hooks/useParties';
import { useCreateExpense, useUpdateExpense } from '@/lib/hooks/useExpenses';
import type { Expense, CreateExpenseInput, UpdateExpenseInput, PaymentMode } from '@/lib/api/expenses';

// ============================================
// Schema
// ============================================

const expenseFormSchema = z.object({
  expenseCategoryItemId: z.string().min(1, 'Expense type is required'),
  expenseDate: z.date({ required_error: 'Date is required' }),
  rate: z.coerce.number().positive('Unit price must be positive'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  partyId: z.string().min(1, 'Please select a vendor/labour/subcontractor'),
  materialTypeItemId: z.string().optional(),
  labourTypeItemId: z.string().optional(),
  subWorkTypeItemId: z.string().optional(),
  paidAmount: z.coerce.number().nonnegative('Paid amount must be zero or positive'),
  paymentMode: z.enum(['CASH', 'CHEQUE', 'ONLINE']).optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

// ============================================
// Types
// ============================================

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  expense?: Expense | null;
}

type ExpenseType = 'Material' | 'Labour' | 'Sub Work' | null;

interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'document';
  preview?: string;
}

// ============================================
// Payment Mode Toggle Component
// ============================================

interface PaymentModeOption {
  value: PaymentMode;
  label: string;
  icon: React.ReactNode;
}

const PAYMENT_MODE_OPTIONS: PaymentModeOption[] = [
  { value: 'CASH', label: 'Cash', icon: <Money className="h-4 w-4" /> },
  { value: 'ONLINE', label: 'Bank Transfer', icon: <Bank className="h-4 w-4" /> },
  { value: 'CHEQUE', label: 'Check', icon: <CreditCard className="h-4 w-4" /> },
];

interface PaymentModeToggleProps {
  value: PaymentMode | undefined;
  onChange: (value: PaymentMode) => void;
}

function PaymentModeToggle({ value, onChange }: PaymentModeToggleProps) {
  return (
    <div className="flex gap-1 w-full h-[56px]">
      {PAYMENT_MODE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center px-3 py-1.5 rounded-md border transition-colors cursor-pointer h-full',
              isSelected
                ? 'border-foreground bg-white'
                : 'border-transparent bg-muted hover:bg-muted/80'
            )}
          >
            <span className={cn('mb-0.5', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
              {option.icon}
            </span>
            <span className={cn('text-xs whitespace-nowrap', isSelected ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// Component
// ============================================

export function AddExpenseModal({
  open,
  onOpenChange,
  projectId,
  expense,
}: AddExpenseModalProps) {
  const isEditing = !!expense;
  const [activeTab, setActiveTab] = useState('manual');
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch category items - using correct key 'expense_type'
  const { data: expenseCategories = [] } = useCategoryItems('expense_type');
  const { data: materialTypes = [] } = useCategoryItems('material_type');
  const { data: labourTypes = [] } = useCategoryItems('labour_type');
  const { data: subWorkTypes = [] } = useCategoryItems('sub_work_type');

  // Fetch parties based on expense type
  const partyType = useMemo(() => {
    switch (selectedExpenseType) {
      case 'Material':
        return 'VENDOR';
      case 'Labour':
        return 'LABOUR';
      case 'Sub Work':
        return 'SUBCONTRACTOR';
      default:
        return undefined;
    }
  }, [selectedExpenseType]);

  const { data: partiesData } = useParties(partyType ? { type: partyType, limit: 100 } : undefined);
  const parties = partiesData?.items ?? [];

  // Mutations
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      expenseCategoryItemId: '',
      expenseDate: new Date(),
      rate: 0,
      quantity: 1,
      partyId: '',
      materialTypeItemId: '',
      labourTypeItemId: '',
      subWorkTypeItemId: '',
      paidAmount: 0,
      paymentMode: 'CASH',
      notes: '',
    },
  });

  // Watch values for calculations
  const watchRate = watch('rate');
  const watchQuantity = watch('quantity');
  const watchPaidAmount = watch('paidAmount');
  const watchExpenseCategory = watch('expenseCategoryItemId');

  // Calculate totals
  const totalAmount = (watchRate || 0) * (watchQuantity || 0);
  const balanceAmount = totalAmount - (watchPaidAmount || 0);

  // Update expense type when category changes
  useEffect(() => {
    const category = expenseCategories.find((c) => c.id === watchExpenseCategory);
    if (category) {
      setSelectedExpenseType(category.name as ExpenseType);
      // Reset party and sub-category when expense type changes
      setValue('partyId', '');
      setValue('materialTypeItemId', '');
      setValue('labourTypeItemId', '');
      setValue('subWorkTypeItemId', '');
    } else {
      setSelectedExpenseType(null);
    }
  }, [watchExpenseCategory, expenseCategories, setValue]);

  // Reset form when dialog opens/closes or expense changes
  useEffect(() => {
    if (open) {
      if (expense) {
        const category = expenseCategories.find((c) => c.id === expense.expenseCategoryItemId);
        setSelectedExpenseType(category?.name as ExpenseType || null);
        
        reset({
          expenseCategoryItemId: expense.expenseCategoryItemId,
          expenseDate: new Date(expense.expenseDate),
          rate: expense.rate,
          quantity: expense.quantity,
          partyId: expense.partyId,
          materialTypeItemId: expense.materialTypeItemId || '',
          labourTypeItemId: expense.labourTypeItemId || '',
          subWorkTypeItemId: expense.subWorkTypeItemId || '',
          paidAmount: expense.payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
          paymentMode: expense.payments?.[0]?.paymentMode || 'CASH',
          notes: expense.notes || '',
        });
        setUploadedFiles([]);
      } else {
        setSelectedExpenseType(null);
        reset({
          expenseCategoryItemId: '',
          expenseDate: new Date(),
          rate: 0,
          quantity: 1,
          partyId: '',
          materialTypeItemId: '',
          labourTypeItemId: '',
          subWorkTypeItemId: '',
          paidAmount: 0,
          paymentMode: 'CASH',
          notes: '',
        });
        setUploadedFiles([]);
      }
    }
  }, [open, expense, reset, expenseCategories]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    try {
      if (isEditing && expense) {
        const updateData: UpdateExpenseInput = {
          partyId: data.partyId,
          expenseCategoryItemId: data.expenseCategoryItemId,
          materialTypeItemId: data.materialTypeItemId || null,
          labourTypeItemId: data.labourTypeItemId || null,
          subWorkTypeItemId: data.subWorkTypeItemId || null,
          rate: data.rate,
          quantity: data.quantity,
          expenseDate: data.expenseDate.toISOString(),
          notes: data.notes || null,
        };
        await updateMutation.mutateAsync({ id: expense.id, data: updateData });
        toast.success('Expense updated successfully');
      } else {
        const createData: CreateExpenseInput = {
          projectId,
          partyId: data.partyId,
          expenseCategoryItemId: data.expenseCategoryItemId,
          materialTypeItemId: data.materialTypeItemId || undefined,
          labourTypeItemId: data.labourTypeItemId || undefined,
          subWorkTypeItemId: data.subWorkTypeItemId || undefined,
          rate: data.rate,
          quantity: data.quantity,
          expenseDate: data.expenseDate.toISOString(),
          notes: data.notes || undefined,
          paidAmount: data.paidAmount > 0 ? data.paidAmount : undefined,
          paymentMode: data.paidAmount > 0 ? data.paymentMode as PaymentMode : undefined,
        };
        await createMutation.mutateAsync(createData);
        toast.success('Expense created successfully');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Failed to update expense' : 'Failed to create expense');
    }
  };

  // File upload handlers
  const handleFileUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onloadend = () => {
      const newFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: isImage ? 'image' : 'document',
        preview: isImage ? reader.result as string : undefined,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => handleFileUpload(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => handleFileUpload(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Get party label based on expense type
  const partyLabel = useMemo(() => {
    switch (selectedExpenseType) {
      case 'Material':
        return 'Vendor';
      case 'Labour':
        return 'Labour';
      case 'Sub Work':
        return 'Sub Contractor';
      default:
        return 'Select Party';
    }
  }, [selectedExpenseType]);

  // Get sub-category options based on expense type
  const subCategoryOptions = useMemo(() => {
    switch (selectedExpenseType) {
      case 'Material':
        return { items: materialTypes, field: 'materialTypeItemId' as const, label: 'Material Type' };
      case 'Labour':
        return { items: labourTypes, field: 'labourTypeItemId' as const, label: 'Labour Type' };
      case 'Sub Work':
        return { items: subWorkTypes, field: 'subWorkTypeItemId' as const, label: 'Sub Work Type' };
      default:
        return null;
    }
  }, [selectedExpenseType, materialTypes, labourTypes, subWorkTypes]);

  // Dynamic labels for Labour expense type
  const rateLabel = selectedExpenseType === 'Labour' ? 'Daily Rate' : 'Unit Price';
  const quantityLabel = selectedExpenseType === 'Labour' ? 'Days' : 'Quantity';

  // Separate uploaded files by type for display
  const uploadedPhotos = uploadedFiles.filter((f) => f.type === 'image');
  const uploadedDocs = uploadedFiles.filter((f) => f.type === 'document');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Project Expense' : 'Add Project Expense'}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="cursor-pointer">Manual</TabsTrigger>
            <TabsTrigger value="scan" className="cursor-pointer">Scan Invoice</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="space-y-6">
                {/* Row 1: Expense Type and Expense Date */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Expense Type */}
                  <div className="space-y-2">
                    <Label>
                      Expense Type <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="expenseCategoryItemId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select expense type" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No expense types found
                              </div>
                            ) : (
                              expenseCategories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                  className="cursor-pointer"
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.expenseCategoryItemId && (
                      <p className="text-sm text-destructive">{errors.expenseCategoryItemId.message}</p>
                    )}
                  </div>

                  {/* Expense Date */}
                  <div className="space-y-2">
                    <Label>
                      Expense Date <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="expenseDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pick a date"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Row 2: Type-specific fields (shown only when expense type is selected) */}
                {selectedExpenseType && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sub-category (Material Type / Labour Type / Sub Work Type) */}
                    {subCategoryOptions && (
                      <div className="space-y-2">
                        <Label>
                          {subCategoryOptions.label} <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                          name={subCategoryOptions.field}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder={`Select ${subCategoryOptions.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {subCategoryOptions.items.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-muted-foreground">
                                    No items found
                                  </div>
                                ) : (
                                  subCategoryOptions.items.map((item) => (
                                    <SelectItem
                                      key={item.id}
                                      value={item.id}
                                      className="cursor-pointer"
                                    >
                                      {item.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}

                    {/* Vendor/Labour/SubContractor */}
                    <div className="space-y-2">
                      <Label>
                        {partyLabel} <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="partyId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder={`Select ${partyLabel.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {parties.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  No {partyLabel.toLowerCase()}s found
                                </div>
                              ) : (
                                parties.map((party) => (
                                  <SelectItem
                                    key={party.id}
                                    value={party.id}
                                    className="cursor-pointer"
                                  >
                                    {party.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.partyId && (
                        <p className="text-sm text-destructive">{errors.partyId.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Row 3: Rate/Quantity/Total */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Daily Rate / Unit Price */}
                  <div className="space-y-2">
                    <Label>
                      {rateLabel} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder={`Enter ${rateLabel.toLowerCase()}`}
                      {...register('rate')}
                      aria-invalid={!!errors.rate}
                    />
                    {errors.rate && (
                      <p className="text-sm text-destructive">{errors.rate.message}</p>
                    )}
                  </div>

                  {/* Days / Quantity */}
                  <div className="space-y-2">
                    <Label>
                      {quantityLabel} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="1"
                      {...register('quantity')}
                      aria-invalid={!!errors.quantity}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-destructive">{errors.quantity.message}</p>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <div className="h-10 px-3 py-2 rounded-md border bg-muted text-muted-foreground flex items-center font-medium">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Row 4: Paid Amount and Balance */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Paid Amount */}
                  <div className="space-y-2">
                    <Label>Paid Amount</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      {...register('paidAmount')}
                      aria-invalid={!!errors.paidAmount}
                    />
                    {errors.paidAmount && (
                      <p className="text-sm text-destructive">{errors.paidAmount.message}</p>
                    )}
                  </div>

                  {/* Balance Amount */}
                  <div className="space-y-2">
                    <Label>Balance Amount</Label>
                    <div className="h-10 px-3 py-2 rounded-md border bg-muted text-muted-foreground flex items-center font-medium">
                      ₹{balanceAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Row 5: Payment Mode and Remarks */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Payment Mode */}
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Controller
                      name="paymentMode"
                      control={control}
                      render={({ field }) => (
                        <PaymentModeToggle
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2">
                    <Label>Remarks</Label>
                    <Textarea
                      placeholder="Enter remarks"
                      className="h-[56px] min-h-[56px] bg-white resize-none"
                      {...register('notes')}
                    />
                  </div>
                </div>

                {/* Row 6: Combined File Upload */}
                <div className="space-y-3">
                  <Label>Upload Files</Label>
                  <label
                    className={cn(
                      'flex flex-col items-center justify-center w-full h-28 cursor-pointer rounded-lg border-2 border-dashed transition-colors',
                      isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                      multiple
                    />
                    <CloudArrowUp className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag files or <span className="text-primary underline">Browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Images, PDF, DOC, XLS (max 10MB each)
                    </p>
                  </label>

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {/* Photos */}
                      {uploadedPhotos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {uploadedPhotos.map((file) => (
                            <div key={file.id} className="relative w-16 h-16 rounded-md overflow-hidden border">
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-destructive text-white flex items-center justify-center cursor-pointer hover:bg-destructive/90"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Documents */}
                      {uploadedDocs.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {uploadedDocs.map((file) => (
                            <div key={file.id} className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="truncate flex-1">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="h-4 w-4 rounded-full bg-destructive text-white flex items-center justify-center cursor-pointer hover:bg-destructive/90 shrink-0"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="cursor-pointer"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : isEditing
                    ? 'Save Changes'
                    : 'Create Expense'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="scan">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Scan Invoice</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload an invoice image to automatically extract expense details
              </p>
              <Button variant="outline" className="cursor-pointer">
                Upload Invoice
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
