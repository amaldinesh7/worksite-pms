// Phone Input Page - Step 1 of auth flow

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Buildings } from '@phosphor-icons/react';

import { useSendOtp } from '@worksite/data';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthCard } from '@/components/auth/AuthCard';
import { CountryCodeSelect } from '@/components/auth/CountryCodeSelect';
import { useAuthStore } from '@/stores/auth.store';

export default function PhoneInput() {
  const navigate = useNavigate();
  const { phoneNumber, countryCode, setPhoneNumber, setCountryCode, setStep } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const sendOtpMutation = useSendOtp();

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setError(null);

    const result = await sendOtpMutation.mutateAsync({ phone: phoneNumber, countryCode });

    if (result.success) {
      setStep('otp');
      navigate('/auth/verify');
    } else {
      setError(result.error?.message || 'Failed to send OTP');
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendOtp();
  };

  return (
    <AuthCard
      icon={<Buildings className="h-7 w-7" weight="fill" />}
      title="Get Started"
      subtitle="Enter your phone number to create an account or log in."
      footer={
        <>
          By continuing, you agree to our{' '}
          <span className="text-neutral-700 underline cursor-pointer">Terms of Service</span> and{' '}
          <span className="text-neutral-700 underline cursor-pointer">Privacy Policy</span>.
        </>
      }
    >
      {/* Form Wrapper */}
      <form onSubmit={handleSubmit}>
        {/* Phone Input */}
        <div className="text-left">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone Number
          </label>
          <div className="flex mt-2">
            <CountryCodeSelect
              value={countryCode}
              onValueChange={setCountryCode}
              disabled={sendOtpMutation.isPending}
            />
            <Input
              id="phone"
              type="tel"
              placeholder="701 229 0437"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              maxLength={12}
              disabled={sendOtpMutation.isPending}
              className="flex-1 rounded-l-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={sendOtpMutation.isPending}
          className="w-full mt-6"
          size="lg"
        >
          {sendOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
        </Button>
      </form>
    </AuthCard>
  );
}
