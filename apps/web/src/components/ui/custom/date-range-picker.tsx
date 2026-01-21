/**
 * DateRangePicker Component
 *
 * A reusable date range picker based on date-range-picker-for-shadcn.
 * Features:
 * - Dual calendar view (previous and current month)
 * - Date input fields for manual entry
 * - Preset ranges (Today, Yesterday, Last 7/14/30 days, etc.)
 * - Optional compare toggle
 * - Update/Cancel buttons
 *
 * @see https://github.com/johnpolacek/date-range-picker-for-shadcn
 */

import * as React from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

// ============================================
// Types
// ============================================

export interface DateRangePickerProps {
  /** Callback when date range is updated */
  onUpdate: (values: { range: DateRange; compareRange?: DateRange }) => void;
  /** Initial start date */
  initialDateFrom?: Date | string;
  /** Initial end date */
  initialDateTo?: Date | string;
  /** Initial compare start date */
  initialCompareFrom?: Date | string;
  /** Initial compare end date */
  initialCompareTo?: Date | string;
  /** Alignment of the popover */
  align?: 'start' | 'center' | 'end';
  /** Locale for date formatting */
  locale?: string;
  /** Whether to show compare feature */
  showCompare?: boolean;
  /** Custom class name */
  className?: string;
  /** Whether to show clear button on hover */
  isClearable?: boolean;
  /** Callback when clear is clicked */
  onClear?: () => void;
}

interface PresetRange {
  label: string;
  getValue: () => DateRange;
}

// ============================================
// Preset Ranges
// ============================================

const PRESET_RANGES: PresetRange[] = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return { from: yesterday, to: yesterday };
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: 'Last 14 days',
    getValue: () => ({
      from: subDays(new Date(), 13),
      to: new Date(),
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    label: 'This Week',
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 0 }),
      to: endOfWeek(new Date(), { weekStartsOn: 0 }),
    }),
  },
  {
    label: 'Last Week',
    getValue: () => {
      const lastWeek = subWeeks(new Date(), 1);
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 0 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 0 }),
      };
    },
  },
  {
    label: 'This Month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Last Month',
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
];

// ============================================
// Helper Functions
// ============================================

function parseDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return new Date(value);
}

function formatDateForInput(date: Date | undefined): string {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function parseDateFromInput(value: string): Date | undefined {
  const parts = value.split('/');
  if (parts.length !== 3) return undefined;
  const [month, day, year] = parts.map(Number);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return undefined;
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return undefined;
  return date;
}

// ============================================
// Date Input Component
// ============================================

interface DateInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

function DateInput({ value, onChange }: DateInputProps) {
  const [inputValue, setInputValue] = React.useState(formatDateForInput(value));

  React.useEffect(() => {
    setInputValue(formatDateForInput(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Only update if valid date or empty
    if (newValue === '') {
      onChange(undefined);
    } else {
      const parsed = parseDateFromInput(newValue);
      if (parsed) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    // Reset to formatted value on blur
    setInputValue(formatDateForInput(value));
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="MM/DD/YYYY"
      className="w-full h-8 px-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

// ============================================
// Component
// ============================================

export function DateRangePicker({
  onUpdate,
  initialDateFrom,
  initialDateTo,
  initialCompareFrom,
  initialCompareTo,
  align = 'end',
  locale = 'en-US',
  showCompare = false,
  className,
  isClearable = false,
  onClear,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Main date range state
  const [range, setRange] = React.useState<DateRange>({
    from: parseDate(initialDateFrom),
    to: parseDate(initialDateTo),
  });

  // Compare date range state
  const [compareRange, setCompareRange] = React.useState<DateRange>({
    from: parseDate(initialCompareFrom),
    to: parseDate(initialCompareTo),
  });

  // Compare toggle state
  const [isCompareEnabled, setIsCompareEnabled] = React.useState(
    !!(initialCompareFrom || initialCompareTo)
  );

  // Selected preset for highlighting
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null);

  // Calendar navigation state
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(
    range.from || new Date()
  );

  // Check if current range matches a preset
  React.useEffect(() => {
    if (!range.from || !range.to) {
      setSelectedPreset(null);
      return;
    }

    const matchingPreset = PRESET_RANGES.find((preset) => {
      const presetRange = preset.getValue();
      return (
        presetRange.from?.toDateString() === range.from?.toDateString() &&
        presetRange.to?.toDateString() === range.to?.toDateString()
      );
    });

    setSelectedPreset(matchingPreset?.label ?? null);
  }, [range]);

  // Handle preset click
  const handlePresetClick = (preset: PresetRange) => {
    const newRange = preset.getValue();
    setRange(newRange);
    setSelectedPreset(preset.label);
    if (newRange.from) {
      setCalendarMonth(newRange.from);
    }
  };

  // Handle calendar select
  const handleCalendarSelect = (newRange: DateRange | undefined) => {
    if (newRange) {
      setRange(newRange);
    }
  };

  // Handle update button click
  const handleUpdate = () => {
    onUpdate({
      range,
      compareRange: isCompareEnabled ? compareRange : undefined,
    });
    setIsOpen(false);
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Reset to initial values
    setRange({
      from: parseDate(initialDateFrom),
      to: parseDate(initialDateTo),
    });
    setCompareRange({
      from: parseDate(initialCompareFrom),
      to: parseDate(initialCompareTo),
    });
    setIsCompareEnabled(!!(initialCompareFrom || initialCompareTo));
    setIsOpen(false);
  };

  // Navigate calendar months
  const handlePrevMonth = () => {
    setCalendarMonth(subMonths(calendarMonth, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(subMonths(calendarMonth, -1));
  };

  // Get previous month for dual calendar
  const prevMonth = subMonths(calendarMonth, 1);

  // Format display value for trigger button
  const displayValue = React.useMemo(() => {
    if (!range.from) return 'Select date range';
    if (!range.to) return format(range.from, 'MMM d, yyyy', { locale: undefined });
    return `${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')}`;
  }, [range]);

  const hasValue = !!range.from;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Clear internal state
    setRange({ from: undefined, to: undefined });
    setIsOpen(false);
    // Notify parent
    onClear?.();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'group justify-start text-left font-normal cursor-pointer bg-white',
            !range.from && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1">{displayValue}</span>
          {isClearable && hasValue && (
            <div className="flex items-center ml-2">
              <div className="h-4 w-px bg-border mx-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <X
                className="h-4 w-4 opacity-0 group-hover:opacity-50 hover:!opacity-100 cursor-pointer transition-opacity"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={handleClear}
              />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex">
          {/* Main content area */}
          <div className="p-4">
            {/* Compare toggle */}
            {showCompare && (
              <div className="flex items-center gap-2 mb-4">
                <Switch
                  checked={isCompareEnabled}
                  onCheckedChange={setIsCompareEnabled}
                  id="compare-toggle"
                />
                <Label htmlFor="compare-toggle" className="text-sm cursor-pointer">
                  Compare
                </Label>
              </div>
            )}

            {/* Date inputs */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <DateInput
                  value={range.from}
                  onChange={(date) => setRange((prev) => ({ ...prev, from: date }))}
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="flex-1">
                <DateInput
                  value={range.to}
                  onChange={(date) => setRange((prev) => ({ ...prev, to: date }))}
                />
              </div>
            </div>

            {/* Compare date inputs */}
            {showCompare && isCompareEnabled && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1">
                  <DateInput
                    value={compareRange.from}
                    onChange={(date) =>
                      setCompareRange((prev) => ({ ...prev, from: date }))
                    }
                  />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="flex-1">
                  <DateInput
                    value={compareRange.to}
                    onChange={(date) =>
                      setCompareRange((prev) => ({ ...prev, to: date }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Dual calendars with navigation */}
            <div className="flex gap-4">
              {/* Previous month calendar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(prevMonth, 'MMMM yyyy')}
                  </span>
                  <div className="w-7" /> {/* Spacer for alignment */}
                </div>
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={handleCalendarSelect}
                  month={prevMonth}
                  onMonthChange={() => {}}
                  showOutsideDays={false}
                  className="p-0"
                />
              </div>

              {/* Current month calendar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7" /> {/* Spacer for alignment */}
                  <span className="text-sm font-medium">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={handleNextMonth}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={handleCalendarSelect}
                  month={calendarMonth}
                  onMonthChange={() => {}}
                  showOutsideDays={false}
                  className="p-0"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="cursor-pointer">
                Update
              </Button>
            </div>
          </div>

          {/* Presets sidebar */}
          <div className="border-l p-4 w-36">
            <div className="flex flex-col gap-1">
              {PRESET_RANGES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    'text-sm text-left px-2 py-1.5 rounded-md transition-colors cursor-pointer',
                    selectedPreset === preset.label
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
