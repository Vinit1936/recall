'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
};

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);
let currentTheme: Theme = 'dark';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getThemeSnapshot() {
  return currentTheme;
}

function updateTheme(theme: Theme) {
  currentTheme = theme;
  listeners.forEach((listener) => listener());
}

function readStoredTheme(storageKey: string): Theme | null {
  try {
    const storedTheme = localStorage.getItem(storageKey);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme, disableTransitionOnChange: boolean) {
  const root = document.documentElement;
  const themeColor = theme === 'dark' ? '#080808' : '#ffffff';

  if (disableTransitionOnChange) {
    root.classList.add('disable-transitions');
    window.setTimeout(() => root.classList.remove('disable-transitions'), 0);
  }

  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = themeColor;
  });
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'theme',
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // Keep the server and first client render identical. Stored preferences are
  // applied after hydration by the effect below.
  const theme = React.useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    () => defaultTheme
  );

  React.useEffect(() => {
    const storedTheme = readStoredTheme(storageKey);
    const initialTheme = storedTheme ?? defaultTheme;
    updateTheme(initialTheme);
    applyTheme(initialTheme, false);
  }, [defaultTheme, storageKey]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      updateTheme(nextTheme);
      applyTheme(nextTheme, disableTransitionOnChange);
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // Theme changes still work when storage is unavailable.
      }
    },
    [disableTransitionOnChange, storageKey]
  );

  const value = React.useMemo(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [setTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
