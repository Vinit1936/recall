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
        border: '1px solid var(--chrome-border)',
        background: 'var(--chrome-bg)',
        overflow: 'hidden',
        boxShadow: 'var(--chrome-shadow)',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          height: '36px',
          background: 'var(--chrome-toolbar-bg)',
          borderBottom: '1px solid var(--chrome-toolbar-border)',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Traffic dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--chrome-dot-red)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--chrome-dot-yellow)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--chrome-dot-green)' }} />
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            maxWidth: '220px',
            margin: '0 auto',
            background: 'var(--chrome-url-bg)',
            border: '1px solid var(--chrome-url-border)',
            borderRadius: '4px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: 'var(--chrome-url-text)',
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
