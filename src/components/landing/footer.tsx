'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        paddingTop: '64px',
        paddingBottom: '40px',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        data-footer-container
        style={{
          maxWidth: 'clamp(1200px, 90vw, 1600px)',
          margin: '0 auto',
          padding: '0 40px',
        }}
      >
        {/* 4-Column Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: '48px 32px',
            marginBottom: '64px',
          }}
          className="footer-grid"
        >
          {/* Col 1: Brand & Tagline */}
          <div>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--foreground)',
                letterSpacing: '-0.03em',
                display: 'inline-block',
                marginBottom: '12px',
              }}
            >
              Recall<span style={{ color: '#ff6b00' }}>.</span>
            </Link>
            <p
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '260px',
              }}
            >
              Master DSA, retain forever.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 20px 0',
                letterSpacing: '-0.01em',
              }}
            >
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'Features', href: '/#capabilities' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Daily Revision', href: '/daily' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={{
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                      fontSize: '14px',
                      color: '#82828e',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#82828e')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 20px 0',
                letterSpacing: '-0.01em',
              }}
            >
              Resources
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'The Science', href: '/#science' },
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'FAQ', href: '/#faq' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms and Conditions', href: '/terms' },
                { label: 'Send Feedback', href: 'https://forms.gle/gZHJsswXm4G3rQ9s6', external: true },
              ].map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'var(--font-geist-sans), sans-serif',
                        fontSize: '14px',
                        color: '#82828e',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#82828e')}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      style={{
                        fontFamily: 'var(--font-geist-sans), sans-serif',
                        fontSize: '14px',
                        color: '#82828e',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#82828e')}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Stay Connect */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 20px 0',
                letterSpacing: '-0.01em',
              }}
            >
              Stay Connect
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                {
                  label: 'GitHub',
                  href: 'https://github.com/Vinit1936/Recall',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  ),
                },
                {
                  label: 'Twitter',
                  href: 'https://twitter.com/vinitpatil193',
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  label: 'LinkedIn',
                  href: 'https://www.linkedin.com/in/vinitpatil19/',
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.222 0h.003z" />
                    </svg>
                  ),
                },
                {
                  label: 'Instagram',
                  href: 'https://instagram.com/vinit.patil19',
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a1a1aa',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#a1a1aa';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright and Legal Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '13px',
              color: 'var(--muted-foreground)',
            }}
          >
            © 2026 Recall. All rights reserved.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <Link
              href="/privacy"
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '13px',
                color: '#52525b',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#a1a1aa')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#52525b')}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '13px',
                color: '#52525b',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#a1a1aa')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#52525b')}
            >
              Terms and Conditions
            </Link>
            <Link
              href="/about"
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '13px',
                color: '#52525b',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#a1a1aa')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#52525b')}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '13px',
                color: '#52525b',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#a1a1aa')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#52525b')}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
