'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import DotBackgroundDemo from '@/components/dot-background-demo';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    const mailtoUrl = `mailto:vinitdpatilwork193@gmail.com?subject=${encodeURIComponent(
      `Recall Message from ${name || 'User'}`
    )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

    window.open(mailtoUrl, '_blank');
    setSubmitted(true);
  };

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
            Contact
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
            Get in touch with the creator.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              margin: '0 0 48px',
            }}
          >
            Have feedback, bug reports, feature requests, or questions about spaced repetition algorithms? Reach out directly through any of the channels below.
          </p>

          {/* Channels List */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '56px' }}>
            {[
              {
                num: '01',
                label: 'Direct Email',
                value: 'vinitdpatilwork193@gmail.com',
                href: 'mailto:vinitdpatilwork193@gmail.com',
              },
              {
                num: '02',
                label: 'GitHub Issues & PRs',
                value: 'github.com/Vinit1936/Recall',
                href: 'https://github.com/Vinit1936/Recall/issues',
              },
              {
                num: '03',
                label: 'Feedback Form',
                value: 'Submit Feedback Form',
                href: 'https://forms.gle/gZHJsswXm4G3rQ9s6',
              },
              {
                num: '04',
                label: 'Twitter / X',
                value: '@vinitpatil193',
                href: 'https://twitter.com/vinitpatil193',
              },
            ].map((c, i) => (
              <div
                key={c.num}
                style={{
                  borderTop: '1px solid var(--border)',
                  padding: '20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  ...(i === 3 ? { borderBottom: '1px solid var(--border)' } : {}),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {c.num}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {c.label}
                  </span>
                </div>

                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {c.value} ↗
                </a>
              </div>
            ))}
          </div>

          {/* Minimal Form */}
          <div style={{ paddingTop: '24px' }}>
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
              Direct Message
            </div>

            {submitted ? (
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '20px',
                }}
              >
                <p style={{ fontFamily: 'var(--font-geist-sans), sans-serif', color: 'var(--text-primary)', fontSize: '14px', margin: '0 0 12px 0' }}>
                  Email client opened with your message draft.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    cursor: 'pointer',
                  }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-geist-mono), monospace',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                      }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'var(--font-geist-sans), sans-serif',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-geist-mono), monospace',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                      }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'var(--font-geist-sans), sans-serif',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message, feedback, or suggestion..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    alignSelf: 'flex-start',
                    padding: '10px 20px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    transition: 'background 0.15s ease',
                  }}
                >
                  Send message →
                </button>
              </form>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </DotBackgroundDemo>
  );
}
