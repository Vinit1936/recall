'use client';

import { useState } from 'react';

type CustomCheckboxProps = {
  checked: boolean;
  onChange: (e: React.MouseEvent) => void;
  title?: string;
  opacity?: number;
  size?: number;
};

export function CustomCheckbox({
  checked,
  onChange,
  title,
  opacity = 1,
  size = 15,
}: CustomCheckboxProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onChange(e);
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          onChange(e as any);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        border: checked
          ? '1px solid var(--foreground)'
          : hovered
          ? '1px solid var(--muted-foreground)'
          : '1px solid var(--border)',
        background: checked
          ? 'var(--foreground)'
          : hovered
          ? 'var(--accent)'
          : 'var(--card)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        opacity,
        boxShadow: 'none',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {checked && (
        <svg
          width={size - 4}
          height={size - 4}
          viewBox="0 0 12 12"
          fill="none"
          stroke="var(--background)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2.5 6 5 8.5 9.5 3.5" />
        </svg>
      )}
    </div>
  );
}
