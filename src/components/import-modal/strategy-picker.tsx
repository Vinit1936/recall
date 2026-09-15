'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ImportStrategy } from '@/lib/import-utils';

type StrategyPickerStepProps = {
  strategy: ImportStrategy;
  onStrategyChange: (s: ImportStrategy) => void;
  dailyPace: number;
  onDailyPaceChange: (pace: number) => void;
  totalProblems: number;
  onContinue: () => void;
  onBack: () => void;
};

export function StrategyPickerStep({
  strategy,
  onStrategyChange,
  dailyPace,
  onDailyPaceChange,
  totalProblems,
  onContinue,
  onBack,
}: StrategyPickerStepProps) {
  const safePace = Math.max(1, dailyPace || 1);
  const staggeredDays = Math.max(1, Math.ceil(totalProblems / safePace));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--foreground)', margin: 0, marginBottom: 4 }}>
          Revision Schedule
        </h3>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>
          Determine how these {totalProblems.toLocaleString()} problems enter your spaced repetition rotation.
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* 1. Staggered */}
        <div
          className="strategy-card"
          onClick={() => onStrategyChange('staggered')}
          style={{
            background: strategy === 'staggered' ? 'var(--card)' : 'var(--background)',
            border: `1px solid ${strategy === 'staggered' ? 'var(--border)' : 'var(--input-border)'}`,
            borderRadius: 6,
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              border: `1px solid ${strategy === 'staggered' ? 'var(--foreground)' : 'var(--muted-foreground)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            {strategy === 'staggered' && (
              <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--foreground)' }} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--foreground)' }}>Spread out</span>
              <span
                style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: 10,
                  color: 'var(--muted-foreground)',
                  border: '1px solid var(--input-border)',
                  padding: '1px 5px',
                  borderRadius: 4,
                }}
              >
                RECOMMENDED
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', margin: 0, marginTop: 4, lineHeight: 1.5 }}>
              Revisions are staggered across the next <strong style={{ color: 'var(--foreground)' }}>~{staggeredDays} {staggeredDays === 1 ? 'day' : 'days'}</strong> so you get ~{safePace} problems/day instead of everything hitting at once.
            </p>

            {/* Daily Pace Selector */}
            {strategy === 'staggered' && (
              <div
                className="strategy-pace-box"
                onClick={(e) => e.stopPropagation()}
                style={{
                  marginTop: 10,
                  padding: '8px 12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 4,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div className="strategy-pace-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Daily pace:</span>
                  <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: 'var(--foreground)' }}>
                    {safePace} problems/day
                  </span>
                </div>

                <div className="strategy-pace-controls" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Presets */}
                  <div className="strategy-pace-presets" style={{ display: 'flex', gap: 4 }}>
                    {[2, 3, 5, 10, 15].map((preset) => (
                      <button
                        key={preset}
                        className="strategy-pace-preset-btn"
                        type="button"
                        onClick={() => onDailyPaceChange(preset)}
                        style={{
                          background: safePace === preset ? 'var(--accent)' : 'none',
                          color: safePace === preset ? 'var(--foreground)' : 'var(--muted-foreground)',
                          border: `1px solid ${safePace === preset ? 'var(--border)' : 'var(--input-border)'}`,
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontSize: 11,
                          fontFamily: 'var(--font-geist-mono), monospace',
                          cursor: 'pointer',
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Stepper */}
                  <div
                    className="strategy-pace-stepper"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--input-border)',
                      borderRadius: 4,
                      background: 'var(--input-bg)',
                    }}
                  >
                    <button
                      type="button"
                      disabled={safePace <= 1}
                      onClick={() => onDailyPaceChange(Math.max(1, safePace - 1))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: safePace <= 1 ? 'var(--muted)' : 'var(--muted-foreground)',
                        padding: '2px 6px',
                        fontSize: 12,
                        cursor: safePace <= 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: 'var(--font-geist-mono), monospace',
                        fontSize: 11.5,
                        color: 'var(--foreground)',
                        padding: '0 4px',
                        minWidth: 20,
                        textAlign: 'center',
                      }}
                    >
                      {safePace}
                    </span>
                    <button
                      type="button"
                      disabled={safePace >= 100}
                      onClick={() => onDailyPaceChange(Math.min(100, safePace + 1))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: safePace >= 100 ? 'var(--muted)' : 'var(--muted-foreground)',
                        padding: '2px 6px',
                        fontSize: 12,
                        cursor: safePace >= 100 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Start fresh */}
        <div
          className="strategy-card"
          onClick={() => onStrategyChange('fresh')}
          style={{
            background: strategy === 'fresh' ? 'var(--card)' : 'var(--background)',
            border: `1px solid ${strategy === 'fresh' ? 'var(--border)' : 'var(--input-border)'}`,
            borderRadius: 6,
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              border: `1px solid ${strategy === 'fresh' ? 'var(--foreground)' : 'var(--muted-foreground)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            {strategy === 'fresh' && (
              <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--foreground)' }} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--foreground)' }}>Start fresh</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', margin: 0, marginTop: 4, lineHeight: 1.5 }}>
              All {totalProblems} problems start at Step 0 and get their first revision in <strong style={{ color: 'var(--foreground)' }}>3 days</strong>, just like newly added problems.
            </p>
          </div>
        </div>

        {/* 3. No revisions */}
        <div
          className="strategy-card"
          onClick={() => onStrategyChange('archive')}
          style={{
            background: strategy === 'archive' ? 'var(--card)' : 'var(--background)',
            border: `1px solid ${strategy === 'archive' ? 'var(--border)' : 'var(--input-border)'}`,
            borderRadius: 6,
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              border: `1px solid ${strategy === 'archive' ? 'var(--foreground)' : 'var(--muted-foreground)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            {strategy === 'archive' && (
              <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--foreground)' }} />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--foreground)' }}>No revisions</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', margin: 0, marginTop: 4, lineHeight: 1.5 }}>
              Problems are imported as <strong style={{ color: 'var(--foreground)' }}>Mastered</strong>. They stay stored in your archive and will not appear in daily review queues unless reactivated.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid var(--input-border)',
            borderRadius: 6,
            color: 'var(--foreground)',
            fontSize: 13,
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--input-border)'; e.currentTarget.style.color = 'var(--foreground)'; }}
        >
          <ArrowLeft size={13} />
          Back
        </button>

        <button
          type="button"
          onClick={onContinue}
          style={{
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 6,
            color: 'var(--primary-foreground)',
            fontSize: 13,
            fontWeight: 500,
            padding: '6px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Review Summary
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
