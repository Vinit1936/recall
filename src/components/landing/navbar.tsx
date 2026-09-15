'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { GitHubStarButton } from './github-star-button';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        if (typeof window !== 'undefined' && window.__lenis) {
          window.__lenis.scrollTo(targetEl, { offset: -60, duration: 1.2 });
        } else {
          const navOffset = 60;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        borderBottom: '1px solid var(--nav-border)',
        height: '52px',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        data-nav-container
        style={{
          maxWidth: 'clamp(1280px, 92vw, 1800px)',
          margin: '0 auto',
          padding: '0 40px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left — wordmark */}
        <Link
          data-nav-logo
          href="/dashboard"
          style={{
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--foreground)',
            letterSpacing: '-0.01em',
            cursor: 'pointer',
          }}
        >
          recall<span style={{ color: '#ff6b00' }}>.</span>
        </Link>

        {/* Center — nav links */}
        <div data-nav-center style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          {[
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Science', href: '#science' },
            { label: 'FAQ', href: '#faq' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '13px',
                color: 'var(--muted-foreground)',
                letterSpacing: '0.02em',
                textDecoration: 'none',
                transition: 'color 0.12s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right — How to use + GitHub + ThemeToggle + Sign in */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            data-nav-howtouse
            href="https://youtu.be/EF25DZDJ6gw"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="How to use Recall (Video Demo)"
            title="How to use Recall"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--muted-foreground)',
              fontSize: '12px',
              fontWeight: 500,
              height: '32px',
              padding: '0 12px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              fontFamily: 'var(--font-geist-sans), sans-serif',
              transition: 'border-color 0.12s ease, color 0.12s ease, background 0.12s ease',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted-foreground)';
            }}
          >
            {/* YouTube logo */}
            <svg
              width="16"
              height="11"
              viewBox="0 0 16 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15.666 1.72a2.003 2.003 0 0 0-1.409-1.418C12.928 0 8 0 8 0S3.072 0 1.743.302A2.003 2.003 0 0 0 .334 1.72C0 3.058 0 5.5 0 5.5s0 2.441.334 3.78a2.003 2.003 0 0 0 1.41 1.418C3.072 11 8 11 8 11s4.928 0 6.257-.302a2.003 2.003 0 0 0 1.41-1.419C16 7.942 16 5.5 16 5.5s0-2.441-.334-3.78z"
                fill="#FF0000"
              />
              <path d="M6.4 7.857 10.514 5.5 6.4 3.143v4.714z" fill="#fff" />
            </svg>
            <span className="nav-howtouse-label">How to use</span>
          </a>

          <GitHubStarButton />

          <ThemeToggle variant="icon" />

          <Link
            data-nav-signin
            href="/auth/login"
            style={{
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--muted-foreground)',
              fontSize: '12px',
              height: '32px',
              padding: '0 16px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              fontFamily: 'var(--font-geist-sans), sans-serif',
              transition: 'border-color 0.12s ease, color 0.12s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted-foreground)';
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
