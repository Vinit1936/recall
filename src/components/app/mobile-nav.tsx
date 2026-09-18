'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ListFilter, Calendar, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

const navItems = [
  {
    label: 'Lists',
    href: '/dashboard',
    icon: ListFilter,
  },
  {
    label: 'Daily',
    href: '/daily',
    icon: Calendar,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  return (
    <div
      data-mobile-nav
      style={{
        display: 'none', // Hidden on desktop by default, overridden to flex on mobile via @media
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        borderRadius: '24px',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
        gap: '4px',
        width: 'max-content',
        maxWidth: 'calc(100vw - 32px)',
        boxSizing: 'border-box',
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{ textDecoration: 'none', position: 'relative' }}
          >
            <motion.div
              whileTap={{ scale: 0.92 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 18px',
                borderRadius: '18px',
                position: 'relative',
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                transition: 'color 0.2s ease',
                gap: '3px',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="dock-active-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '18px',
                    background: 'var(--accent)',
                    border: '1px solid var(--border)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color="currentColor" />
              </div>

              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: '10px',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: '0.02em',
                }}
              >
                {item.label}
              </span>

              {/* Active Orange Accent Dot */}
              {isActive && (
                <motion.div
                  layoutId="dock-active-dot"
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    background: '#ff6b00',
                    boxShadow: '0 0 6px #ff6b00',
                    zIndex: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}

      {/* Quick Theme Toggle Button on Mobile Dock */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 14px',
          borderRadius: '18px',
          background: 'transparent',
          border: 'none',
          color: 'var(--muted-foreground)',
          cursor: 'pointer',
          gap: '3px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isDark ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-indigo-500" />
          )}
        </div>
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontWeight: 400,
            letterSpacing: '0.02em',
          }}
        >
          {isDark ? 'Light' : 'Dark'}
        </span>
      </motion.button>
    </div>
  );
}
