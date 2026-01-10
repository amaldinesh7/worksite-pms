// Phone Input Page - Step 1 of auth flow

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../lib/api';

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+971', label: 'UAE (+971)' },
];

export default function PhoneInput() {
  const navigate = useNavigate();
  const { phoneNumber, countryCode, setPhoneNumber, setCountryCode, setStep } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await authApi.sendOtp(phoneNumber, countryCode);

    setIsLoading(false);

    if (result.success) {
      setStep('otp');
      navigate('/auth/verify');
    } else {
      setError(result.error?.message || 'Failed to send OTP');
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Format as XXX XXX XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrapper}>
          <div style={styles.iconContainer}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 style={styles.title}>Get Started</h1>
        <p style={styles.subtitle}>
          Enter your phone number to create an account or log in.
        </p>

        {/* Phone Input */}
        <div style={styles.inputSection}>
          <label style={styles.label}>Phone Number</label>
          <div style={styles.phoneInputWrapper}>
            {/* Country Code Dropdown */}
            <div style={styles.countryCodeWrapper}>
              <button
                type="button"
                style={styles.countryCodeButton}
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <span>{countryCode}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#737373" style={{ marginLeft: 8 }}>
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              {showCountryDropdown && (
                <div style={styles.dropdown}>
                  {COUNTRY_CODES.map((country) => (
                    <button
                      key={country.code}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setCountryCode(country.code);
                        setShowCountryDropdown(false);
                      }}
                    >
                      {country.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Input */}
            <input
              type="tel"
              placeholder="701 229 0437"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              style={styles.phoneInput}
              maxLength={12}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Submit Button */}
        <button
          onClick={handleSendOtp}
          disabled={isLoading}
          style={{
            ...styles.submitButton,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>

        {/* Terms */}
        <p style={styles.terms}>
          By continuing, you agree to our{' '}
          <span style={styles.link}>Terms of Service</span> and{' '}
          <span style={styles.link}>Privacy Policy</span>.
        </p>
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
  phoneInputWrapper: {
    display: 'flex',
    width: '100%',
  },
  countryCodeWrapper: {
    position: 'relative',
  },
  countryCodeButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    border: '1px solid #d4d4d4',
    borderRight: 'none',
    borderRadius: '6px 0 0 6px',
    padding: '0 16px',
    height: 40,
    fontSize: 14,
    color: '#171717',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'white',
    border: '1px solid #d4d4d4',
    borderRadius: 6,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 10,
    marginTop: 4,
    minWidth: 150,
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    fontSize: 14,
    cursor: 'pointer',
    color: '#171717',
  },
  phoneInput: {
    flex: 1,
    height: 40,
    border: '1px solid #d4d4d4',
    borderRadius: '0 6px 6px 0',
    padding: '0 12px',
    fontSize: 14,
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
  terms: {
    fontSize: 12,
    color: '#737373',
    marginTop: 24,
    paddingLeft: 16,
    paddingRight: 16,
  },
  link: {
    color: '#404040',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};
