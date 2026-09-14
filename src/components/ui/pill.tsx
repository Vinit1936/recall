import type { ReactNode } from 'react';

type PillProps = {
  bg: string;
  text: string;
  border?: string;
  children: ReactNode;
};

/** Shared compact label treatment for difficulty and topic values. */
export function Pill({ bg, text, border, children }: PillProps) {
  return (
    <span
      data-pill
      style={{
        background: bg,
        color: text,
        border: border ? `1px solid ${border}` : undefined,
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 165,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </span>
  );
}
