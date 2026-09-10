'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
// @ts-ignore
import downloadImg from '../../../../utils/download.jpg';
// @ts-ignore
import GridDistortion from '@/components/ui/grid-distortion';
import { useMediaQuery } from '@/hooks/use-media-query';
import { MobileAuth } from '@/components/auth/mobile-auth';

import { OtpInput } from '@/components/auth/otp-input';

type Tab = 'signin' | 'signup';
type AuthMode = 'form' | 'verify' | 'forgot' | 'reset';

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked: 'This email is already registered with a different sign-in method. Try signing in with the method you used originally.',
  OAuthCallback: 'Something went wrong with the OAuth login. Please try again.',
  OAuthSignin: 'Could not start the OAuth sign-in flow. Please try again.',
  CredentialsSignin: 'Invalid email or password.',
  EmailNotVerified: 'Your email is not verified yet. Please enter the verification code sent to your email.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected error occurred. Please try again.',
};

function Spinner({ color = '#ffffff' }: { color?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        border: `2px solid ${color}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

function Input({
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  rightLabelAction,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  rightLabelAction?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ display: 'block', fontSize: 13, color: '#888' }}>{label}</label>
        {rightLabelAction}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: '#1a1a1a',
            border: `1px solid ${focused ? '#444' : '#2a2a2a'}`,
            borderRadius: 6,
            color: '#fff',
            fontSize: 14,
            padding: isPassword ? '10px 38px 10px 14px' : '10px 14px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 10,
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
              transition: 'color 0.15s',
            }}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function PrimaryButton({ children, onClick, loading, disabled }: { children: React.ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: '100%',
        background: loading || disabled ? '#2a2a2a' : '#fff',
        color: loading || disabled ? '#888' : '#000',
        borderWidth: 0,
        outline: 'none',
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        padding: '11px 0',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.15s',
        marginBottom: 8,
      }}
    >
      {loading ? <Spinner color="#888" /> : children}
    </button>
  );
}

function OAuthButton({ provider, label, onClick, loading, disabled }: { provider: 'google' | 'github'; label: string; onClick: () => void; loading?: boolean; disabled?: boolean }) {
  const isGoogle = provider === 'google';
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: '100%',
        background: 'transparent',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#2a2a2a',
        outline: 'none',
        borderRadius: 6,
        color: loading || disabled ? '#666' : '#fff',
        fontSize: 14,
        padding: '10px 0',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 8,
        transition: 'border-color 0.15s',
        opacity: disabled && !loading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) e.currentTarget.style.borderColor = '#444';
      }}
      onMouseLeave={(e) => {
        if (!loading && !disabled) e.currentTarget.style.borderColor = '#2a2a2a';
      }}
    >
      {loading ? (
        <Spinner color="#888" />
      ) : isGoogle ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      )}
      {loading ? 'Connecting...' : label}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
      <span style={{ fontSize: 12, color: '#555' }}>or</span>
      <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
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

  // Cooldown countdown timer
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
    setForgotSuccess('');
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
        // Direct sign-in fallback if verification is bypassed
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
        setVerifyError(json.error || 'Verification failed. Please check the code.');
        return;
      }

      // If we have the password in memory, log them in automatically
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
        // Switch back to sign in
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
        setResendSuccess('New verification code sent to your inbox!');
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
    // Request a fresh code
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

  if (isMobile) {
    return <MobileAuth />;
  }

  return (
    <div data-auth-container style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#09090b' }}>
      {/* Left panel — smaller width (40%) in a box with 24px corner radius (Desktop Only) */}
      {!isMobile && (
        <div
          data-auth-left
          style={{
            width: '40%',
            height: '100vh',
            padding: '20px 10px 20px 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              background: '#0a0a0b',
            }}
          >
            {/* Interactive Three.js WebGL GridDistortion */}
            <GridDistortion
              imageSrc={downloadImg.src || '/login-bg.jpg'}
              grid={15}
              mouse={0.1}
              strength={0.15}
              relaxation={0.9}
            />

            {/* Dark gradient overlay for contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'linear-gradient(180deg, rgba(10, 10, 11, 0.1) 0%, rgba(10, 10, 11, 0.85) 100%)',
              }}
            />

            {/* Bottom Tagline Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '36px',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Solve once.<br />
                <span style={{ color: '#a1a1aa', fontWeight: 400 }}>Remember forever.</span>
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Right panel — larger form area (60%) in a matching box with 24px corner radius */}
      <div
        data-auth-right
        style={{
          width: isMobile ? '100%' : '60%',
          height: isMobile ? 'auto' : '100vh',
          minHeight: isMobile ? '100vh' : undefined,
          padding: isMobile ? '16px' : '20px 20px 20px 10px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          data-auth-card
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 24,
            background: '#131315',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '100%', maxWidth: 400 }}>
            {mode === 'verify' ? (
              /* Verification View */
              <motion.div
                key="verify-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginBottom: 20 }}>
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
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: 0,
                      marginBottom: 16,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                  >
                    ← Back to signup
                  </button>

                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Check your email
                  </h1>
                  <p style={{ fontSize: 13, color: '#888888', margin: 0, lineHeight: 1.5 }}>
                    We sent a 6-digit verification code to <strong style={{ color: '#ffffff' }}>{verifyEmail}</strong>. Enter it below to verify your account.
                  </p>
                </div>

                {verifyError && (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#f87171',
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.2)',
                      borderRadius: 6,
                      padding: '10px 14px',
                      fontFamily: 'var(--font-geist-mono), monospace',
                      marginBottom: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    {verifyError}
                  </div>
                )}

                {resendSuccess && (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#4ade80',
                      background: 'rgba(74, 222, 128, 0.1)',
                      border: '1px solid rgba(74, 222, 128, 0.2)',
                      borderRadius: 6,
                      padding: '10px 14px',
                      marginBottom: 16,
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

                <PrimaryButton
                  onClick={() => handleVerifyCode()}
                  loading={verifyLoading}
                  disabled={otp.length !== 6 || verifyLoading}
                >
                  Verify & Continue →
                </PrimaryButton>

                <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#71717a' }}>
                  {resendCooldown > 0 ? (
                    <span>Resend code in <strong style={{ color: '#a1a1aa' }}>{resendCooldown}s</strong></span>
                  ) : (
                    <span>
                      Didn&apos;t receive the code?{' '}
                      <button
                        onClick={handleResendCode}
                        disabled={resendLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: 13,
                          textDecoration: 'underline',
                          padding: 0,
                          fontWeight: 500,
                        }}
                      >
                        {resendLoading ? 'Sending...' : 'Resend code'}
                      </button>
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#52525b' }}>
                  Entered the wrong email?{' '}
                  <button
                    onClick={() => setMode('form')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a1a1aa',
                      cursor: 'pointer',
                      fontSize: 12,
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Change email
                  </button>
                </div>
              </motion.div>
            ) : mode === 'forgot' ? (
              /* Forgot Password View */
              <motion.div
                key="forgot-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => {
                      setMode('form');
                      setForgotError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888888',
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: 0,
                      marginBottom: 16,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                  >
                    ← Back to sign in
                  </button>

                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Reset your password
                  </h1>
                  <p style={{ fontSize: 13, color: '#888888', margin: 0, lineHeight: 1.5 }}>
                    Enter your registered email address and we&apos;ll send you a 6-digit code to reset your password.
                  </p>
                </div>

                {forgotError && (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#f87171',
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.2)',
                      borderRadius: 6,
                      padding: '10px 14px',
                      marginBottom: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    {forgotError}
                  </div>
                )}

                <Input
                  label="Email"
                  type="email"
                  value={forgotEmail}
                  onChange={setForgotEmail}
                  placeholder="you@example.com"
                />

                <PrimaryButton
                  onClick={handleRequestPasswordReset}
                  loading={forgotLoading}
                  disabled={!forgotEmail.trim() || forgotLoading}
                >
                  Send reset code →
                </PrimaryButton>

                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#71717a' }}>
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
                      fontSize: 12,
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Sign in
                  </button>
                </div>
              </motion.div>
            ) : mode === 'reset' ? (
              /* Reset Password View */
              <motion.div
                key="reset-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => {
                      setMode('forgot');
                      setResetError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888888',
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: 0,
                      marginBottom: 16,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                  >
                    ← Change email
                  </button>

                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Set new password
                  </h1>
                  <p style={{ fontSize: 13, color: '#888888', margin: 0, lineHeight: 1.5 }}>
                    Enter the 6-digit code sent to <strong style={{ color: '#ffffff' }}>{forgotEmail}</strong> and choose a new password.
                  </p>
                </div>

                {resetError && (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#f87171',
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.2)',
                      borderRadius: 6,
                      padding: '10px 14px',
                      marginBottom: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    {resetError}
                  </div>
                )}

                {forgotSuccess && (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#4ade80',
                      background: 'rgba(74, 222, 128, 0.1)',
                      border: '1px solid rgba(74, 222, 128, 0.2)',
                      borderRadius: 6,
                      padding: '10px 14px',
                      marginBottom: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    {forgotSuccess}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#888888', marginBottom: 8 }}>
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

                <Input
                  label="New password (min 8 characters)"
                  type="password"
                  value={resetNewPassword}
                  onChange={setResetNewPassword}
                  placeholder="••••••••"
                />

                <Input
                  label="Confirm new password"
                  type="password"
                  value={resetConfirmPassword}
                  onChange={setResetConfirmPassword}
                  placeholder="••••••••"
                />

                <PrimaryButton
                  onClick={handleResetPassword}
                  loading={resetLoading}
                  disabled={resetOtp.length !== 6 || resetNewPassword.length < 8 || !resetConfirmPassword || resetLoading}
                >
                  Reset password & sign in →
                </PrimaryButton>

                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#71717a' }}>
                  {forgotCooldown > 0 ? (
                    <span>Resend code in <strong style={{ color: '#a1a1aa' }}>{forgotCooldown}s</strong></span>
                  ) : (
                    <span>
                      Didn&apos;t receive the code?{' '}
                      <button
                        onClick={handleResendResetCode}
                        disabled={forgotLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: 13,
                          textDecoration: 'underline',
                          padding: 0,
                          fontWeight: 500,
                        }}
                      >
                        {forgotLoading ? 'Sending...' : 'Resend code'}
                      </button>
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Standard Auth Form */
              <div>
                {/* Tab switcher */}
                <div style={{ display: 'flex', marginBottom: 28, borderBottom: '1px solid #1e1e1e', paddingBottom: 0, position: 'relative' }}>
                  <button
                    onClick={() => setTab('signin')}
                    disabled={isAnyLoading}
                    style={{
                      background: 'none',
                      borderWidth: 0,
                      outline: 'none',
                      cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                      fontSize: 15,
                      fontWeight: 500,
                      color: tab === 'signin' ? '#ffffff' : '#666666',
                      padding: '0 0 10px 0',
                      marginRight: 24,
                      position: 'relative',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    Sign in
                    {tab === 'signin' && (
                      <motion.div
                        layoutId="activeTabIndicator"
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
                      background: 'none',
                      borderWidth: 0,
                      outline: 'none',
                      cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                      fontSize: 15,
                      fontWeight: 500,
                      color: tab === 'signup' ? '#ffffff' : '#666666',
                      padding: '0 0 10px 0',
                      position: 'relative',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    Sign up
                    {tab === 'signup' && (
                      <motion.div
                        layoutId="activeTabIndicator"
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

                {/* Smooth Form Content Transition */}
                <AnimatePresence mode="wait">
                  {tab === 'signin' ? (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {forgotSuccess && (
                        <div
                          style={{
                            fontSize: 13,
                            color: '#4ade80',
                            background: 'rgba(74, 222, 128, 0.1)',
                            border: '1px solid rgba(74, 222, 128, 0.2)',
                            borderRadius: 6,
                            padding: '10px 14px',
                            marginBottom: 16,
                            lineHeight: 1.4,
                          }}
                        >
                          {forgotSuccess}
                        </div>
                      )}
                      {siError && (
                        <div
                          style={{
                            fontSize: 13,
                            color: '#f87171',
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                            borderRadius: 6,
                            padding: '10px 14px',
                            marginBottom: 16,
                            lineHeight: 1.4,
                          }}
                        >
                          <div>{siError}</div>
                        </div>
                      )}
                      <Input label="Email" type="email" value={siEmail} onChange={setSiEmail} placeholder="you@example.com" />
                      <Input
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
                              fontSize: 12,
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
                          >
                            Forgot password?
                          </button>
                        }
                      />
                      <PrimaryButton onClick={handleSignIn} loading={siLoading} disabled={isAnyLoading}>Sign in →</PrimaryButton>
                      <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 4 }}>
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
                            fontSize: 12,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#a1a1aa')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
                        >
                          Need to verify your signup email? Enter code →
                        </button>
                      </div>
                      <Divider />
                      <OAuthButton
                        provider="google"
                        label="Continue with Google"
                        onClick={() => handleOAuthSignIn('google')}
                        loading={oauthLoading === 'google'}
                        disabled={isAnyLoading}
                      />
                      <OAuthButton
                        provider="github"
                        label="Continue with GitHub"
                        onClick={() => handleOAuthSignIn('github')}
                        loading={oauthLoading === 'github'}
                        disabled={isAnyLoading}
                      />
                      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#555' }}>
                        Don&apos;t have an account?{' '}
                        <button onClick={() => setTab('signup')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>Sign up</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {suError && (
                        <div
                          style={{
                            fontSize: 13,
                            color: '#f87171',
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                            borderRadius: 6,
                            padding: '10px 14px',
                            fontFamily: 'var(--font-geist-mono), monospace',
                            marginBottom: 16,
                            lineHeight: 1.4,
                          }}
                        >
                          {suError}
                        </div>
                      )}
                      <Input label="Name (optional)" type="text" value={suName} onChange={setSuName} placeholder="Your name" />
                      <Input label="Email" type="email" value={suEmail} onChange={setSuEmail} placeholder="you@example.com" />
                      <Input label="Password (min 8 characters)" type="password" value={suPassword} onChange={setSuPassword} placeholder="••••••••" />
                      <PrimaryButton onClick={handleSignUp} loading={suLoading} disabled={isAnyLoading}>Create account →</PrimaryButton>
                      <Divider />
                      <OAuthButton
                        provider="google"
                        label="Continue with Google"
                        onClick={() => handleOAuthSignIn('google')}
                        loading={oauthLoading === 'google'}
                        disabled={isAnyLoading}
                      />
                      <OAuthButton
                        provider="github"
                        label="Continue with GitHub"
                        onClick={() => handleOAuthSignIn('github')}
                        loading={oauthLoading === 'github'}
                        disabled={isAnyLoading}
                      />
                      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#555' }}>
                        Already have an account?{' '}
                        <button onClick={() => setTab('signin')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>Sign in</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ background: '#09090b', minHeight: '100vh' }} />}>
      <LoginContent />
    </Suspense>
  );
}
