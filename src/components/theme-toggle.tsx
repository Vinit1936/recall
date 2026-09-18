'use client';

import * as React from 'react';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'sidebar' | 'segmented';
  className?: string;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
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
          color: 'var(--muted-foreground)',
          background: 'transparent',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--foreground)';
          e.currentTarget.style.background = 'var(--secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--muted-foreground)';
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
