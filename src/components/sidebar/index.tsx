'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Settings, MessageSquare } from 'lucide-react';
import { FeedbackModal } from '@/components/feedback-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { GitHubStarButton } from '@/components/landing/github-star-button';

const navItems = [
  {
    label: 'Lists',
    href: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
      </svg>
    ),
  },
  {
    label: 'Daily Revision',
    href: '/daily',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="8" cy="11" r="1.5" fill="currentColor" opacity="0.8"/>
      </svg>
    ),
  },
  {
    label: 'Sheets',
    href: '/sheets',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings size={16} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <aside
        data-sidebar
        style={{
          width: 240,
          minWidth: 240,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 12px',
          zIndex: 10,
        }}
      >
        {/* Wordmark + Theme Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 12,
            paddingRight: 6,
            marginBottom: 28,
          }}
        >
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--foreground)',
                letterSpacing: '-0.02em',
                cursor: 'pointer',
              }}
            >
              recall<span style={{ color: '#F7981E' }}>.</span>
            </div>
          </Link>

          <ThemeToggle variant="ghost" />
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {navItems.map((item) => {
            // Prefix match, not strict equality: /sheets has child routes
            // (/sheets/fraz, /sheets/blind-75, ...) and the nav item must stay
            // highlighted while browsing one. Strict equality left the item
            // unlit on every sheet detail page.
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 12px',
                  borderRadius: 6,
                  fontSize: 13.5,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--sidebar-item-active-color)' : 'var(--text-muted)',
                  background: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--sidebar-item-hover-color)';
                    e.currentTarget.style.background = 'var(--sidebar-item-hover-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ color: isActive ? 'var(--sidebar-item-active-color)' : 'var(--text-subtle)' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Minimal Feedback Nav Item */}
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
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
            <MessageSquare size={16} style={{ color: 'var(--text-subtle)' }} />
            <span>Feedback</span>
          </button>

          {/* Minimal GitHub Star Nav Item */}
          <GitHubStarButton variant="sidebar" />
        </nav>

        {/* User + Sign out */}
        <div style={{ paddingLeft: 12, paddingRight: 12, borderTop: '1px solid var(--sidebar-user-border)', paddingTop: 14 }}>
          {session?.user && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
                {session.user.name || session.user.email}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{ background: 'var(--sidebar-signout-bg)', border: '1px solid var(--sidebar-signout-border)', borderRadius: 5, color: 'var(--sidebar-signout-color)', cursor: 'pointer', fontSize: 12, padding: '4px 10px', width: '100%', textAlign: 'left', transition: 'color 0.15s, border-color 0.15s, background 0.15s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--foreground)';
                  e.currentTarget.style.borderColor = 'var(--input-focus-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--sidebar-signout-color)';
                  e.currentTarget.style.borderColor = 'var(--sidebar-signout-border)';
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
