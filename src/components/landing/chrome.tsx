import React from 'react';

type ChromeProps = {
  url: string;
  children: React.ReactNode;
  height?: number | string;
};

export function Chrome({ url, children, height }: ChromeProps) {
  return (
    <div
      style={{
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          height: '36px',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Traffic dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56', opacity: 0.85 }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e', opacity: 0.85 }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f', opacity: 0.85 }} />
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            maxWidth: '220px',
            margin: '0 auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.02em',
            }}
          >
            {url}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ height: height ?? 'auto', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
