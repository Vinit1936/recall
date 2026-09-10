'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { OtpInput } from '@/components/auth/otp-input';

type Tab = 'signin' | 'signup';
type AuthMode = 'form' | 'verify' | 'forgot' | 'reset';

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked: 'This email is already registered with a different sign-in method.',
  OAuthCallback: 'Something went wrong with the OAuth login. Please try again.',
  OAuthSignin: 'Could not start the OAuth sign-in flow. Please try again.',
  CredentialsSignin: 'Invalid email or password.',
  EmailNotVerified: 'Your email is not verified yet. Please enter your verification code.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected error occurred. Please try again.',
};

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        border: '2px solid #888888',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
}

function MobileInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  rightLabelAction,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rightLabelAction?: React.ReactNode;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: '#888888' }}>{label}</label>
        {rightLabelAction}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '16px',
            padding: isPassword ? '12px 42px 12px 14px' : '12px 14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: '#888888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function MobileAuth() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('signin');
  const [mode, setMode] = useState<AuthMode>('form');

  // Sign in state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siError, setSiError] = useState('');
  const [siLoading, setSiLoading] = useState(false);

  // Sign up state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suError, setSuError] = useState('');
  const [suLoading, setSuLoading] = useState(false);

  // Verification state
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // Forgot / Reset password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);

  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // OAuth loading state
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Forgot password cooldown countdown timer
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setTimeout(() => {
      setForgotCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [forgotCooldown]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const msg = errorMessages[errorParam] || errorMessages.Default;
      setSiError(msg);
    }
  }, [searchParams]);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setSiError('');
    setSuError('');
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setSiError('Could not start the OAuth sign-in flow. Please try again.');
      setOauthLoading(null);
    }
  };

  const handleSignIn = async () => {
    setSiError('');
    setSiLoading(true);
    try {
      const res = await signIn('credentials', {
        email: siEmail.trim().toLowerCase(),
        password: siPassword,
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        setSiError(errorMessages.CredentialsSignin);
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setSiError(errorMessages.Default);
    } finally {
      setSiLoading(false);
    }
  };

  const handleSignUp = async () => {
    setSuError('');
    if (suPassword.length < 8) {
      setSuError('Password must be at least 8 characters.');
      return;
    }
    setSuLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: suName, email: suEmail, password: suPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSuError(json.error ?? 'Sign up failed.');
        return;
      }

      if (json.requiresVerification) {
        setVerifyEmail(suEmail.trim().toLowerCase());
        setVerifyPassword(suPassword);
        setOtp('');
        setVerifyError('');
        setResendSuccess('');
        setResendCooldown(60);
        setMode('verify');
      } else {
        const loginRes = await signIn('credentials', {
          email: suEmail,
          password: suPassword,
          callbackUrl,
          redirect: false,
        });
        if (loginRes?.error) {
          setSuError('Account created but sign in failed. Please sign in manually.');
          setTab('signin');
        } else {
          window.location.href = callbackUrl;
        }
      }
    } catch {
      setSuError('Something went wrong. Please try again.');
    } finally {
      setSuLoading(false);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length !== 6) {
      setVerifyError('Please enter the full 6-digit verification code.');
      return;
    }

    setVerifyError('');
    setResendSuccess('');
    setVerifyLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, code }),
      });
      const json = await res.json();

      if (!res.ok) {
        setVerifyError(json.error || 'Verification failed. Please check code.');
        return;
      }

      if (verifyPassword) {
        const loginRes = await signIn('credentials', {
          email: verifyEmail,
          password: verifyPassword,
          callbackUrl,
          redirect: false,
        });
        if (loginRes?.error) {
          setMode('form');
          setTab('signin');
          setSiEmail(verifyEmail);
          setSiError('Email verified! Please sign in with your password.');
        } else {
          window.location.href = callbackUrl;
        }
      } else {
        setMode('form');
        setTab('signin');
        setSiEmail(verifyEmail);
        setSiError('');
      }
    } catch {
      setVerifyError('Something went wrong. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setVerifyError('');
    setResendSuccess('');

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const json = await res.json();

      if (!res.ok) {
        setVerifyError(json.error || 'Failed to resend code.');
      } else {
        setResendSuccess('New code sent to your inbox!');
        setResendCooldown(60);
      }
    } catch {
      setVerifyError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setForgotError(json.error || 'Failed to send reset code.');
      } else {
        setForgotSuccess(json.message || 'If an account exists, a reset code was sent.');
        setForgotCooldown(60);
        setResetOtp('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setResetError('');
        setMode('reset');
      }
    } catch {
      setForgotError('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendResetCode = async () => {
    if (forgotCooldown > 0 || forgotLoading) return;
    setForgotLoading(true);
    setResetError('');
    setForgotSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setResetError(json.error || 'Failed to resend code.');
      } else {
        setForgotSuccess('New reset code sent to your inbox!');
        setForgotCooldown(60);
      }
    } catch {
      setResetError('Failed to resend reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (resetOtp.length !== 6) {
      setResetError('Please enter the 6-digit reset code.');
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetError('');
    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          code: resetOtp,
          newPassword: resetNewPassword,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setResetError(json.error || 'Failed to reset password.');
      } else {
        setMode('form');
        setTab('signin');
        setSiEmail(forgotEmail);
        setSiPassword('');
        setSiError('');
        setForgotSuccess('Password reset successfully! Please sign in with your new password.');
      }
    } catch {
      setResetError('Something went wrong. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handlePromptVerifyFromLogin = (email: string) => {
    setVerifyEmail(email.trim().toLowerCase());
    setVerifyPassword(siPassword);
    setOtp('');
    setVerifyError('');
    setResendSuccess('');
    setMode('verify');
    fetch('/api/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setResendSuccess('Verification code sent to your email.');
          setResendCooldown(60);
        }
      })
      .catch(() => {});
  };

  const isAnyLoading = siLoading || suLoading || verifyLoading || forgotLoading || resetLoading || oauthLoading !== null;
  const currentError = tab === 'signin' ? siError : suError;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-geist-sans), sans-serif',
      }}
    >
      {/* Brand Logo & Tagline */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '24px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            recall<span style={{ color: '#ff6b00' }}>.</span>
          </span>
        </Link>
        <p style={{ fontSize: '13px', color: '#888888', margin: '6px 0 0 0' }}>
          Solve once. Remember forever.
        </p>
      </div>

      {/* Main Form Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#131315',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '28px 20px',
          boxSizing: 'border-box',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
        }}
      >
        {mode === 'verify' ? (
          /* Mobile Verification View */
          <motion.div
            key="mobile-verify"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => {
                setMode('form');
                setVerifyError('');
                setResendSuccess('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#888888',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
                marginBottom: '16px',
              }}
            >
              ← Back
            </button>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '0 0 6px 0',
              }}
            >
              Verify your email
            </h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Code sent to <strong style={{ color: '#ffffff' }}>{verifyEmail}</strong>
            </p>

            {verifyError && (
              <div
                style={{
                  background: '#200e0e',
                  border: '1px solid #481a1a',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#f87171',
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.4,
                }}
              >
                {verifyError}
              </div>
            )}

            {resendSuccess && (
              <div
                style={{
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#4ade80',
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.4,
                }}
              >
                {resendSuccess}
              </div>
            )}

            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={(code) => handleVerifyCode(code)}
              disabled={verifyLoading}
              error={!!verifyError}
              autoFocus
            />

            <button
              onClick={() => handleVerifyCode()}
              disabled={otp.length !== 6 || verifyLoading}
              style={{
                width: '100%',
                height: '44px',
                background: otp.length === 6 && !verifyLoading ? '#ffffff' : '#2a2a2a',
                color: otp.length === 6 && !verifyLoading ? '#000000' : '#888888',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: otp.length === 6 && !verifyLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                marginBottom: '16px',
              }}
            >
              {verifyLoading ? <Spinner /> : 'Verify & Continue →'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>
              {resendCooldown > 0 ? (
                <span>Resend in <strong style={{ color: '#a1a1aa' }}>{resendCooldown}s</strong></span>
              ) : (
                <span>
                  Didn&apos;t get the code?{' '}
                  <button
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {resendLoading ? 'Sending...' : 'Resend'}
                  </button>
                </span>
              )}
            </div>

            <div style={{ textAlign: 'center', fontSize: '12px', color: '#52525b' }}>
              <button
                onClick={() => setMode('form')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888888',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Change email address
              </button>
            </div>
          </motion.div>
        ) : mode === 'forgot' ? (
          /* Mobile Forgot Password View */
          <motion.div
            key="mobile-forgot"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => {
                setMode('form');
                setForgotError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#888888',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
                marginBottom: '16px',
              }}
            >
              ← Back to sign in
            </button>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '0 0 6px 0',
              }}
            >
              Reset your password
            </h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Enter your email and we&apos;ll send you a 6-digit code to reset your password.
            </p>

            {forgotError && (
              <div
                style={{
                  background: '#200e0e',
                  border: '1px solid #481a1a',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#f87171',
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.4,
                }}
              >
                {forgotError}
              </div>
            )}

            <MobileInput
              label="Email"
              type="email"
              value={forgotEmail}
              onChange={setForgotEmail}
              placeholder="you@example.com"
            />

            <button
              onClick={handleRequestPasswordReset}
              disabled={!forgotEmail.trim() || forgotLoading}
              style={{
                width: '100%',
                height: '44px',
                background: forgotEmail.trim() && !forgotLoading ? '#ffffff' : '#2a2a2a',
                color: forgotEmail.trim() && !forgotLoading ? '#000000' : '#888888',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: forgotEmail.trim() && !forgotLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                marginBottom: '16px',
              }}
            >
              {forgotLoading ? <Spinner /> : 'Send reset code →'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '12px', color: '#71717a' }}>
              Remembered your password?{' '}
              <button
                onClick={() => {
                  setMode('form');
                  setTab('signin');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Sign in
              </button>
            </div>
          </motion.div>
        ) : mode === 'reset' ? (
          /* Mobile Reset Password View */
          <motion.div
            key="mobile-reset"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => {
                setMode('forgot');
                setResetError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#888888',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
                marginBottom: '16px',
              }}
            >
              ← Change email
            </button>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '0 0 6px 0',
              }}
            >
              Set new password
            </h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Code sent to <strong style={{ color: '#ffffff' }}>{forgotEmail}</strong>
            </p>

            {resetError && (
              <div
                style={{
                  background: '#200e0e',
                  border: '1px solid #481a1a',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#f87171',
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.4,
                }}
              >
                {resetError}
              </div>
            )}

            {forgotSuccess && (
              <div
                style={{
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#4ade80',
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.4,
                }}
              >
                {forgotSuccess}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#888888', marginBottom: '8px' }}>
                6-digit reset code
              </label>
              <OtpInput
                value={resetOtp}
                onChange={setResetOtp}
                disabled={resetLoading}
                error={!!resetError}
                autoFocus
              />
            </div>

            <MobileInput
              label="New password (min 8 chars)"
              type="password"
              value={resetNewPassword}
              onChange={setResetNewPassword}
              placeholder="••••••••"
            />

            <MobileInput
              label="Confirm new password"
              type="password"
              value={resetConfirmPassword}
              onChange={setResetConfirmPassword}
              placeholder="••••••••"
            />

            <button
              onClick={handleResetPassword}
              disabled={resetOtp.length !== 6 || resetNewPassword.length < 8 || !resetConfirmPassword || resetLoading}
              style={{
                width: '100%',
                height: '44px',
                background:
                  resetOtp.length === 6 && resetNewPassword.length >= 8 && resetConfirmPassword && !resetLoading
                    ? '#ffffff'
                    : '#2a2a2a',
                color:
                  resetOtp.length === 6 && resetNewPassword.length >= 8 && resetConfirmPassword && !resetLoading
                    ? '#000000'
                    : '#888888',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor:
                  resetOtp.length === 6 && resetNewPassword.length >= 8 && resetConfirmPassword && !resetLoading
                    ? 'pointer'
                    : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                marginBottom: '16px',
              }}
            >
              {resetLoading ? <Spinner /> : 'Reset password & sign in →'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#71717a' }}>
              {forgotCooldown > 0 ? (
                <span>Resend in <strong style={{ color: '#a1a1aa' }}>{forgotCooldown}s</strong></span>
              ) : (
                <span>
                  Didn&apos;t get the code?{' '}
                  <button
                    onClick={handleResendResetCode}
                    disabled={forgotLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {forgotLoading ? 'Sending...' : 'Resend'}
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          /* Mobile Standard Form View */
          <div>
            {/* Tab Switcher */}
            <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid #1e1e1e', position: 'relative' }}>
              <button
                onClick={() => setTab('signin')}
                disabled={isAnyLoading}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: tab === 'signin' ? '#ffffff' : '#666666',
                  paddingBottom: '10px',
                  position: 'relative',
                }}
              >
                Sign in
                {tab === 'signin' && (
                  <motion.div
                    layoutId="activeMobileTab"
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: '#ffffff',
                      borderRadius: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => setTab('signup')}
                disabled={isAnyLoading}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: tab === 'signup' ? '#ffffff' : '#666666',
                  paddingBottom: '10px',
                  position: 'relative',
                }}
              >
                Sign up
                {tab === 'signup' && (
                  <motion.div
                    layoutId="activeMobileTab"
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: '#ffffff',
                      borderRadius: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Success Alert Box */}
            {forgotSuccess && (
              <div
                style={{
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#4ade80',
                  fontSize: '13px',
                  marginBottom: '20px',
                  lineHeight: 1.4,
                }}
              >
                {forgotSuccess}
              </div>
            )}

            {/* Error Alert Box */}
            {currentError && (
              <div
                style={{
                  background: '#200e0e',
                  border: '1px solid #481a1a',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#f87171',
                  fontSize: '13px',
                  marginBottom: '20px',
                  lineHeight: 1.4,
                }}
              >
                <div>{currentError}</div>
              </div>
            )}

            {/* Form Inputs */}
            <AnimatePresence mode="wait">
              {tab === 'signin' ? (
                <motion.div
                  key="mobile-signin"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <MobileInput
                    label="Email"
                    type="email"
                    value={siEmail}
                    onChange={setSiEmail}
                    placeholder="you@example.com"
                  />

                  <MobileInput
                    label="Password"
                    type="password"
                    value={siPassword}
                    onChange={setSiPassword}
                    placeholder="••••••••"
                    rightLabelAction={
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(siEmail);
                          setForgotError('');
                          setForgotSuccess('');
                          setMode('forgot');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a1a1aa',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        Forgot password?
                      </button>
                    }
                  />

                  <button
                    onClick={handleSignIn}
                    disabled={isAnyLoading}
                    style={{
                      width: '100%',
                      height: '44px',
                      background: isAnyLoading ? '#2a2a2a' : '#ffffff',
                      color: isAnyLoading ? '#888888' : '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    {siLoading ? <Spinner /> : 'Sign in →'}
                  </button>

                  <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (siEmail) {
                          handlePromptVerifyFromLogin(siEmail);
                        } else {
                          setMode('verify');
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#71717a',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Need to verify your signup email? Enter code →
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mobile-signup"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <MobileInput
                    label="Full Name"
                    type="text"
                    value={suName}
                    onChange={setSuName}
                    placeholder="Alex Rivers"
                  />

                  <MobileInput
                    label="Email"
                    type="email"
                    value={suEmail}
                    onChange={setSuEmail}
                    placeholder="you@example.com"
                  />

                  <MobileInput
                    label="Password (min 8 characters)"
                    type="password"
                    value={suPassword}
                    onChange={setSuPassword}
                    placeholder="••••••••"
                  />

                  <button
                    onClick={handleSignUp}
                    disabled={isAnyLoading}
                    style={{
                      width: '100%',
                      height: '44px',
                      background: isAnyLoading ? '#2a2a2a' : '#ffffff',
                      color: isAnyLoading ? '#888888' : '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    {suLoading ? <Spinner /> : 'Create Account →'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
              <span style={{ fontSize: 12, color: '#555555' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
            </div>

            {/* OAuth Buttons */}
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isAnyLoading}
              style={{
                width: '100%',
                height: '44px',
                background: 'transparent',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              {oauthLoading === 'google' ? (
                <Spinner />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={isAnyLoading}
              style={{
                width: '100%',
                height: '44px',
                background: 'transparent',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              {oauthLoading === 'github' ? (
                <Spinner />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              )}
              Continue with GitHub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

