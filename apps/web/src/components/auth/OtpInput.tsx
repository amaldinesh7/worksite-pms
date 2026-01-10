import { useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only allow digits
      if (inputValue && !/^\d$/.test(inputValue)) return;

      const newOtp = [...value];
      newOtp[index] = inputValue;
      onChange(newOtp);

      // Auto-focus next input
      if (inputValue && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [value]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newOtp = [...value];

      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }

      onChange(newOtp);

      // Focus last filled input or next empty
      const lastFilledIndex = Math.min(pastedData.length - 1, OTP_LENGTH - 1);
      inputRefs.current[lastFilledIndex]?.focus();
    },
    [value, onChange]
  );

  return (
    <div className="flex justify-between gap-2">
      {value.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'h-12 w-12 text-center text-lg font-medium',
            error && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
      ))}
    </div>
  );
}

export { OTP_LENGTH };
