'use client';

import * as React from 'react';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'sidebar' | 'segmented' | 'nav';
  className?: string;
  style?: React.CSSProperties;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ variant = 'icon', className = '', style }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  if (variant === 'segmented') {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        data-theme-segmented
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all cursor-pointer border ${
            mounted && resolvedTheme === 'light'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
              : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          <span className="inline-flex items-center gap-1.5 justify-center">
            <Sun size={14} className="text-amber-500" />
            Light
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all cursor-pointer border ${
            !mounted || resolvedTheme === 'dark'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
              : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          <span className="inline-flex items-center gap-1.5 justify-center">
            <Moon size={14} className="text-indigo-400" />
            Dark
          </span>
        </button>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '7px 12px',
          borderRadius: 6,
          fontSize: 13.5,
          fontWeight: 400,
          color: 'var(--text-muted)',
          background: 'transparent',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--sidebar-item-hover-color)';
          e.currentTarget.style.background = 'var(--sidebar-item-hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {isDark ? (
          <Sun size={16} className="text-amber-400" />
        ) : (
          <Moon size={16} className="text-indigo-500" />
        )}
        <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
      </button>
    );
  }

  if (variant === 'nav') {
    return (
      <button
        type="button"
        data-nav-theme
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: '1px solid var(--landing-btn-border)',
          background: 'var(--landing-btn-bg)',
          color: 'var(--landing-btn-color)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
          transition: 'border-color 0.12s ease, color 0.12s ease, background 0.12s ease',
          flexShrink: 0,
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--landing-btn-hover-border)';
          e.currentTarget.style.color = 'var(--landing-btn-hover-color)';
          e.currentTarget.style.background = 'var(--landing-btn-hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--landing-btn-border)';
          e.currentTarget.style.color = 'var(--landing-btn-color)';
          e.currentTarget.style.background = 'var(--landing-btn-bg)';
        }}
      >
        {mounted ? (
          isDark ? (
            <Sun size={15} style={{ color: 'currentColor', transition: 'color 0.12s ease' }} />
          ) : (
            <Moon size={15} style={{ color: 'currentColor', transition: 'color 0.12s ease' }} />
          )
        ) : (
          <span style={{ width: '15px', height: '15px' }} />
        )}
      </button>
    );
  }

  // Default 'icon' variant
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background/80 hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground transition-all cursor-pointer ${className}`}
    >
      {mounted ? (
        isDark ? (
          <Sun size={15} className="text-amber-400" />
        ) : (
          <Moon size={15} className="text-indigo-500" />
        )
      ) : (
        <span className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
