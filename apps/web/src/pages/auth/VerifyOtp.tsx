// OTP Verification Page - Step 2 of auth flow

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from '@phosphor-icons/react';

import { useSendOtp, useVerifyOtp } from '@worksite/data';

import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/AuthCard';
import { OtpInput, OTP_LENGTH } from '@/components/auth/OtpInput';
import { useAuthStore } from '@/stores/auth.store';

const RESEND_COOLDOWN = 30;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { phoneNumber, countryCode, loginSuccess, setStep } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();

  // Redirect if no phone number
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/auth');
    }
  }, [phoneNumber, navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    const code = otp.join('');

    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError(null);

    const result = await verifyOtpMutation.mutateAsync({ phone: phoneNumber, code, countryCode });

    if (result.success && result.data) {
      // Store user, organization, role, and token
      loginSuccess({
        user: result.data.user,
        organization: result.data.organization,
        role: result.data.role,
        accessToken: result.data.accessToken,
      });
      navigate('/');
    } else {
      setError(result.error?.message || 'Invalid OTP');
      setOtp(Array(OTP_LENGTH).fill(''));
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const result = await sendOtpMutation.mutateAsync({ phone: phoneNumber, countryCode });

    if (result.success) {
      setResendTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
    } else {
      setError(result.error?.message || 'Failed to resend OTP');
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    navigate('/auth');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLoading = verifyOtpMutation.isPending || sendOtpMutation.isPending;
  const displayPhone = `${countryCode} ${phoneNumber}`;

  return (
    <AuthCard
      icon={<ShieldCheck className="h-7 w-7" weight="fill" />}
      title="Verify Your Number"
      subtitle={
        <>
          Enter the 6-digit code sent to {displayPhone}.{' '}
          <button
            onClick={handleChangeNumber}
            className="text-neutral-600 underline text-xs ml-1 hover:text-neutral-800"
          >
            Change
          </button>
        </>
      }
    >
      {/* OTP Input */}
      <div className="text-left">
        <label className="text-sm font-medium text-neutral-700">Verification Code</label>
        <div className="mt-2">
          <OtpInput value={otp} onChange={setOtp} error={!!error} disabled={isLoading} />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}

      {/* Submit Button */}
      <Button onClick={handleVerify} disabled={isLoading} className="w-full mt-6" size="lg">
        {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify & Continue'}
      </Button>

      {/* Resend */}
      <p className="text-sm text-neutral-500 mt-6">
        Didn't receive the code?{' '}
        <button
          onClick={handleResendOtp}
          disabled={resendTimer > 0 || isLoading}
          className={`font-medium ${
            resendTimer > 0 ? 'text-neutral-400 cursor-default' : 'text-neutral-900 hover:underline'
          }`}
        >
          Resend OTP
        </button>
      </p>
      {resendTimer > 0 && (
        <p className="text-xs text-neutral-400 mt-1">
          You can resend after {formatTimer(resendTimer)}
        </p>
      )}
    </AuthCard>
  );
}
