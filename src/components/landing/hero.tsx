'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Chrome } from './chrome';
import type { ComponentType } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TableDemoMobile } from './table-demo-mobile';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 + i * 0.1 },
  }),
};

interface HeroProps {
  TableDemo: ComponentType;
}

export function Hero({ TableDemo }: HeroProps) {
  const isMobile = useMediaQuery('(max-width: 1024px)');

  return (
    <section style={{ position: 'relative', overflowX: 'clip', width: '100%' }}>
      {/* Main grid */}
      <div
        data-hero-grid
        className="hero-v2-grid"
        style={{
          minHeight: 'calc(100vh - 52px)',
          paddingTop: '52px',
          paddingLeft: 'max(28px, calc((100vw - 1640px) / 2))',
          paddingRight: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(390px, 430px) 1fr',
          gap: '40px',
          width: '100%',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Left column */}
        <div
          data-hero-left
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: isMobile ? '24px' : '110px',
            paddingBottom: '24px',
            transform: 'translateX(-8px)',
          }}
        >
          {/* Label */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={itemVariants} style={{ marginBottom: '16px' }}>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Spaced repetition for DSA
            </span>
          </motion.div>

          {/* Headline — lightweight (300), confident hero size fitting strictly in 2 lines */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={itemVariants} style={{ marginBottom: '18px' }}>
            <h1 data-hero-title style={{ margin: 0, padding: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 300,
                  fontSize: 'clamp(32px, 3.2vw, 42px)',
                  lineHeight: 1.12,
                  letterSpacing: '-0.025em',
                }}
              >
                <span style={{ color: 'var(--text-primary)', display: 'block' }}>
                  Turn solved problems
                </span>
                <span style={{ color: 'var(--hero-muted-text, #71717a)', display: 'block' }}>
                  into lasting intuition.
                </span>
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '14.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              letterSpacing: '-0.01em',
              maxWidth: '420px',
              margin: 0,
              marginBottom: '28px',
            }}
          >
            You solve a problem today and forget it next week. Recall reminds you to revisit questions right before you forget them, so you remember patterns in your interviews.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            data-hero-cta
            custom={3}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            <Link
              href="/auth/login"
              style={{
                background: 'var(--text-primary)',
                color: 'var(--bg)',
                fontSize: '13px',
                fontWeight: 600,
                height: '40px',
                padding: '0 20px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), sans-serif',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Start tracking free →
            </Link>

            <a
              href="https://www.producthunt.com/products/recall-27?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-recall-81d0b196-22e4-4d6e-9c06-12f568e670a5"
              target="_blank"
              rel="noopener noreferrer"
              data-hero-producthunt
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '40px',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.filter = 'brightness(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <img
                alt="recall. - Never forget your solved DSA questions. | Product Hunt"
                width={250}
                height={54}
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1238527&theme=light&t=1789143552040"
                style={{
                  height: '40px',
                  width: 'auto',
                  borderRadius: '8px',
                  display: 'block',
                }}
              />
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.04em',
              }}
            >
              Built by a student, for students grinding DSA
            </span>
          </motion.div>

          {/* Mobile Demo — Centered below CTA */}
          {isMobile && (
            <div data-mobile-demo style={{ marginTop: '32px', width: '100%' }}>
              <TableDemoMobile />
            </div>
          )}
        </div>

        {/* Right column — demo bleeds off right edge of screen */}
        <div
          data-hero-right
          className="hero-v2-right"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            paddingTop: '64px',
            paddingBottom: '32px',
            overflow: 'visible',
          }}
        >
          {!isMobile && (
            <motion.div
              data-desktop-demo
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: 0.5 }}
              style={{
                width: 'max(980px, calc(100% + 140px))',
                minWidth: '920px',
                flexShrink: 0,
              }}
            >
              <Chrome url="recallx.tech" height={530}>
                <TableDemo />
              </Chrome>
            </motion.div>
          )}
        </div>
      </div>



      <style>{`
        :root {
          --hero-muted-text: #71717a;
        }
        .dark {
          --hero-muted-text: #8e8e8e;
        }
        @media (max-width: 1024px) {
          .hero-v2-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding: 72px 24px 40px !important;
            min-height: auto !important;
          }
          .hero-v2-right { display: none !important; }
          div[data-hero-left] {
            transform: none !important;
            padding-top: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
