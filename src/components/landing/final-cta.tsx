'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      data-final-cta
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
        padding: '60px 40px 0',
      }}
    >
      {/* Background wordmark */}
      <div
        data-final-wordmark
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontWeight: 700,
          fontSize: 'clamp(90px, 12vw, 180px)',
          color: 'var(--border)',
          opacity: 0.6,
          pointerEvents: 'none',
          userSelect: 'none',
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
        }}
      >
        <span style={{ position: 'relative', display: 'inline-block' }}>
          recall
          <span
            style={{
              position: 'absolute',
              left: '100%',
              bottom: 0,
              color: 'rgba(255, 107, 0, 0.5)',
            }}
          >
            .
          </span>
        </span>
      </div>

      {/* Foreground content */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          paddingBottom: '140px',
        }}
      >
        {/* Flying Shooting Star Line */}
        <div
          style={{
            position: 'relative',
            width: '1.5px',
            height: '80px',
            background: 'var(--border)',
            margin: '0 auto 32px',
            overflow: 'hidden',
            borderRadius: '2px',
          }}
        >
          <motion.div
            animate={{
              y: ['-100%', '260%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: [0.16, 1, 0.3, 1],
              repeatDelay: 0.4,
            }}
            style={{
              width: '100%',
              height: '36px',
              background: 'linear-gradient(to bottom, transparent, var(--text-primary) 75%, var(--text-primary))',
              boxShadow: '0 0 10px var(--text-primary), 0 0 18px var(--text-primary)',
            }}
          />
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(40px, 5vw, 72px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Start remembering
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.08em',
            marginTop: '16px',
            textTransform: 'uppercase',
          }}
        >
          Free. No credit card. No nonsense.
        </p>

        <div style={{ marginTop: '36px' }}>
          <Link
            href="/auth/login"
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg)',
              fontSize: '14px',
              fontWeight: 600,
              height: '44px',
              padding: '0 28px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              fontFamily: 'var(--font-geist-sans), sans-serif',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Get started free →
          </Link>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontSize: '13px',
            marginTop: '20px',
          }}
        >
          <span style={{ color: 'var(--text-tertiary)' }}>Already have an account? </span>
          <Link
            href="/auth/login"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.12s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Sign in →
          </Link>
        </p>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          section[style*="padding: 120px 40px 0"] {
            padding: 80px 24px 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
