'use client';

import { useState, useEffect } from 'react';

function formatStars(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return count.toString();
}

export function GitHubStarButton() {
  const [stars, setStars] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('recall_github_stars');
        if (cached) {
          const parsed = parseInt(cached, 10);
          if (!isNaN(parsed) && parsed >= 0) return parsed;
        }
      } catch {}
    }
    return 4; // Instant 0ms render default matching current repo stars
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/github/stars')
      .then((res) => res.json())
      .then((data) => {
        if (mounted && typeof data?.stars === 'number') {
          setStars(data.stars);
          try {
            localStorage.setItem('recall_github_stars', String(data.stars));
          } catch {}
        }
      })
      .catch(() => {
        // Fallback already active
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <a
      data-nav-github
      href="https://github.com/Vinit1936/Recall"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Star Recall on GitHub (${stars} stars)`}
      title={`Star Recall on GitHub (${stars} stars)`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        height: '32px',
        padding: '0 10px',
        borderRadius: '8px',
        background: isHovered ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${isHovered ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)'}`,
        color: isHovered ? '#ffffff' : '#888888',
        fontSize: '12px',
        fontWeight: 500,
        fontFamily: 'var(--font-geist-sans), sans-serif',
        textDecoration: 'none',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {/* GitHub Octocat Icon */}
      <svg
        height="15"
        width="15"
        viewBox="0 0 16 16"
        fill="currentColor"
        style={{
          display: 'block',
          flexShrink: 0,
          color: isHovered ? '#ffffff' : '#888888',
          transition: 'color 0.15s ease',
        }}
      >
        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
      </svg>

      {/* Label (Star) — hidden on small screens for ultra-compact layout */}
      <span
        className="nav-github-label"
        style={{
          color: isHovered ? '#ffffff' : '#888888',
          transition: 'color 0.15s ease',
        }}
      >
        Star
      </span>

      {/* Vertical divider */}
      <span
        style={{
          display: 'inline-block',
          width: '1px',
          height: '13px',
          background: isHovered ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.1)',
          margin: '0 1px',
          transition: 'background 0.15s ease',
        }}
      />

      {/* Star Icon & Dynamic Counter */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="#eab308"
          stroke="#eab308"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            display: 'block',
            flexShrink: 0,
            transform: isHovered ? 'scale(1.18) rotate(6deg)' : 'scale(1)',
            transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: isHovered
              ? 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.65))'
              : 'drop-shadow(0 0 2.5px rgba(234, 179, 8, 0.35))',
          }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        <span
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '11px',
            fontWeight: 600,
            color: isHovered ? '#ffffff' : '#e5e5e5',
            letterSpacing: '-0.01em',
            transition: 'color 0.15s ease',
          }}
        >
          {formatStars(stars)}
        </span>
      </span>
    </a>
  );
}
