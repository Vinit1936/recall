'use client';

export function NotionTableHeader() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '70px minmax(180px, 1fr) 95px 125px 220px 32px',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--muted-foreground)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}
    >
      <div>#</div>
      <div>Problem Title</div>
      <div>Difficulty</div>
      <div>Topic</div>
      <div>Confidence Rating</div>
      <div style={{ textAlign: 'right' }}>Link</div>
    </div>
  );
}
