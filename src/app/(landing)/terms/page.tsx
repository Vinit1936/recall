import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import DotBackgroundDemo from '@/components/dot-background-demo';

export const metadata: Metadata = {
  title: 'Terms and Conditions — User Agreement',
  description:
    'Review the Terms and Conditions of Recall. Read our user agreement, acceptable use guidelines, and platform service terms.',
  keywords: ['Recall terms of service', 'Recall terms and conditions', 'user agreement'],
};

const SECTIONS = [
  {
    num: '01',
    title: 'Acceptance of terms',
    desc: 'By accessing or using Recall (recallx.tech), you agree to be bound by these Terms and Conditions. If you disagree with any portion of these terms, you may not use the service.',
  },
  {
    num: '02',
    title: 'Free educational service',
    desc: 'Recall is provided free of charge for individual software engineers and competitive programmers preparing for technical interviews and mastering data structures and algorithms.',
  },
  {
    num: '03',
    title: 'Platform disclaimer',
    desc: 'Recall is an independent open-source tool. It is not affiliated with, endorsed by, or sponsored by LeetCode, Codeforces, HackerRank, GeeksForGeeks, or CodeChef. All trademarks belong to their respective owners.',
  },
  {
    num: '04',
    title: 'Acceptable use',
    desc: 'You agree not to attempt to disrupt or abuse the service, overload database APIs, reverse-engineer Cloudflare bot protections, or use automated scripts to spam requests.',
  },
  {
    num: '05',
    title: 'Limitation of liability',
    desc: 'Recall is provided "AS IS" without warranties of any kind. The creators and contributors of Recall are not liable for any direct or indirect damages resulting from your use of the application.',
  },
];

export default function TermsPage() {
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
            Terms of Service · August 2026
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
            Terms and conditions of service.
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
            These terms govern your access to and use of Recall. Please read them carefully before using the spaced repetition platform.
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
              Questions regarding these terms? Reach out to{' '}
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
