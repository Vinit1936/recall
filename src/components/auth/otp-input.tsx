'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into an array of characters
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value;
    if (!char) return;

    // Take the last character entered in this box
    const lastChar = char.slice(-1);
    if (!/^\d$/.test(lastChar)) return;

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const nextVal = newDigits.join('');
    onChange(nextVal);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (nextVal.length === length && onComplete) {
      onComplete(nextVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').trim();
    const cleanNumbers = pasted.replace(/\D/g, '').slice(0, length);
    if (!cleanNumbers) return;

    onChange(cleanNumbers);

    const targetFocusIndex = Math.min(cleanNumbers.length, length - 1);
    inputRefs.current[targetFocusIndex]?.focus();

    if (cleanNumbers.length === length && onComplete) {
      onComplete(cleanNumbers);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '16px 0',
      }}
    >
      {Array.from({ length }).map((_, index) => {
        const isFilled = !!digits[index];
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[index]}
            disabled={disabled}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            style={{
              width: '46px',
              height: '52px',
              background: 'var(--input-bg)',
              border: error
                ? '1px solid var(--error)'
                : isFilled
                ? '1px solid var(--foreground)'
                : '1px solid var(--input-border)',
              borderRadius: '8px',
              color: 'var(--foreground)',
              fontSize: '22px',
              fontFamily: 'var(--font-geist-mono), monospace',
              fontWeight: 600,
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
               boxShadow: isFilled ? '0 0 0 1px color-mix(in srgb, var(--foreground) 5%, transparent)' : 'none',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.6 : 1,
            }}
            onFocusCapture={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--primary) 10%, transparent)';
              }
            }}
            onBlurCapture={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = isFilled ? 'var(--foreground)' : 'var(--input-border)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
        );
      })}
    </div>
  );
}
