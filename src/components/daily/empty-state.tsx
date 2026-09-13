'use client';

import Link from 'next/link';

export function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
        gap: 12,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--foreground)' }}>
        ⌈ You&apos;re all caught up ⌋
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.6, marginTop: 4 }}>
        No problems due today. Come back tomorrow,
        <br />
        or add new problems from the table.
      </div>
      <Link
        href="/dashboard"
        style={{
          marginTop: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          color: 'var(--muted-foreground)',
          fontSize: 13,
          padding: '7px 16px',
          textDecoration: 'none',
          transition: 'color 0.15s, border-color 0.15s',
        }}
      >
        Go to problems table →
      </Link>
    </div>
  );
}
