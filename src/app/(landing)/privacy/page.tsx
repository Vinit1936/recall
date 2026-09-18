import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import DotBackgroundDemo from '@/components/dot-background-demo';

export const metadata: Metadata = {
  title: 'Privacy Policy — How We Protect Your Data',
  description:
    'Read the Recall Privacy Policy. Learn how we handle your problem tracking data, authentication, platform handles, and guarantee your data privacy.',
  keywords: ['Recall privacy policy', 'data security', 'spaced repetition privacy', 'LeetCode tracker privacy'],
};

const SECTIONS = [
  {
    num: '01',
    title: 'Information we collect',
    desc: 'When you create an account via OAuth (Google, GitHub) or Email/Password, we store your name, email address, and avatar. When you link your coding accounts (LeetCode, Codeforces, HackerRank, GeeksForGeeks, CodeChef), we store only your public username. When you log problems, we record the problem metadata, your revision dates, and recall confidence ratings.',
  },
  {
    num: '02',
    title: 'Zero credentials policy',
    desc: 'Recall never requests, accesses, or stores passwords or private session cookies for third-party platforms. Problem data and metadata resolution are fetched exclusively using public APIs and public profiles.',
  },
  {
    num: '03',
    title: 'How your data is used',
    desc: 'Your problem logs are used strictly to calculate your adaptive spaced repetition schedule (+3, +7, +14, +30 days), compute daily revision queues, and track your practice streak. We do not sell or monetize personal user data.',
  },
  {
    num: '04',
    title: 'Infrastructure & security',
    desc: 'Recall runs on Vercel with encrypted SSL connections, uses Neon PostgreSQL for secure cloud database storage, and Cloudflare Turnstile for privacy-preserving bot protection without user tracking.',
  },
  {
    num: '05',
    title: 'Data ownership & deletion',
    desc: 'You maintain full ownership of your data. You can export your problems and revision history in CSV/JSON format at any time. You may also request complete account and data deletion by emailing vinitdpatilwork193@gmail.com.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <DotBackgroundDemo>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
        <article
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '0 32px',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Privacy Policy · August 2026
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(34px, 4vw, 46px)',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              margin: '0 0 24px',
            }}
          >
            Privacy policy & data practices.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              margin: '0 0 56px',
            }}
          >
            Recall is designed with minimal data collection. We collect only what is necessary to authenticate your account and calculate your personal spaced repetition revision schedule.
          </p>

          {/* Editorial Sections */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SECTIONS.map((sec, i) => (
              <div
                key={sec.num}
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '28px',
                  paddingBottom: '32px',
                  ...(i === SECTIONS.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontSize: '11px',
                      color: '#ff6b00',
                    }}
                  >
                    {sec.num}
                  </span>
                  <h2
                    style={{
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {sec.title}
                  </h2>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.75,
                    margin: 0,
                    paddingLeft: '32px',
                  }}
                >
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Contact note */}
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <p
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                margin: 0,
              }}
            >
              Questions about this policy? Contact us at{' '}
              <a
                href="mailto:vinitdpatilwork193@gmail.com"
                style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}
              >
                vinitdpatilwork193@gmail.com
              </a>
              .
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </DotBackgroundDemo>
  );
}
