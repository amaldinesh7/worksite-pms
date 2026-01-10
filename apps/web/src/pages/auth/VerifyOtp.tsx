// OTP Verification Page - Step 2 of auth flow

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../lib/api';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { phoneNumber, countryCode, loginSuccess, setStep } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus last filled input or next empty
    const lastFilledIndex = Math.min(pastedData.length - 1, OTP_LENGTH - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');

    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await authApi.verifyOtp(phoneNumber, code, countryCode);

    setIsLoading(false);

    if (result.success && result.data) {
      // Store user and access token (refresh token is handled via httpOnly cookie by server)
      loginSuccess(result.data.user, result.data.tokens.accessToken);
      navigate('/');
    } else {
      setError(result.error?.message || 'Invalid OTP');
      // Clear OTP on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    const result = await authApi.sendOtp(phoneNumber, countryCode);
    setIsLoading(false);

    if (result.success) {
      setResendTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
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

  const displayPhone = `${countryCode} ${phoneNumber}`;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrapper}>
          <div style={styles.iconContainer}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 style={styles.title}>Verify Your Number</h1>
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to {displayPhone}.{' '}
          <button onClick={handleChangeNumber} style={styles.changeLink}>
            Change
          </button>
        </p>

        {/* OTP Input */}
        <div style={styles.inputSection}>
          <label style={styles.label}>Verification Code</label>
          <div style={styles.otpWrapper}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                style={{
                  ...styles.otpInput,
                  borderColor: error ? '#dc2626' : '#d4d4d4',
                }}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Submit Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading}
          style={{
            ...styles.submitButton,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify & Continue'}
        </button>

        {/* Resend */}
        <p style={styles.resendText}>
          Didn't receive the code?{' '}
          <button
            onClick={handleResendOtp}
            disabled={resendTimer > 0}
            style={{
              ...styles.resendButton,
              cursor: resendTimer > 0 ? 'default' : 'pointer',
              color: resendTimer > 0 ? '#a3a3a3' : '#171717',
            }}
          >
            Resend OTP
          </button>
        </p>
        {resendTimer > 0 && (
          <p style={styles.timerText}>You can resend after {formatTimer(resendTimer)}</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    border: '1px solid #e5e5e5',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: 400,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#171717',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 400,
    color: '#171717',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#737373',
    marginTop: 8,
    marginBottom: 0,
  },
  changeLink: {
    color: '#525252',
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: 12,
    cursor: 'pointer',
    marginLeft: 4,
  },
  inputSection: {
    width: '100%',
    marginTop: 32,
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: 14,
    color: '#404040',
    marginBottom: 8,
  },
  otpWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpInput: {
    width: 48,
    height: 48,
    textAlign: 'center',
    fontSize: 18,
    border: '1px solid #d4d4d4',
    borderRadius: 6,
    outline: 'none',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#171717',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 500,
    marginTop: 24,
    cursor: 'pointer',
  },
  resendText: {
    fontSize: 14,
    color: '#737373',
    marginTop: 24,
    marginBottom: 0,
  },
  resendButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: 14,
    fontWeight: 500,
  },
  timerText: {
    fontSize: 12,
    color: '#a3a3a3',
    marginTop: 4,
  },
};
