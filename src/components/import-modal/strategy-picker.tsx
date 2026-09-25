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
        <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-white)', margin: 0, marginBottom: 4 }}>
          Revision Schedule
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>
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
            background: strategy === 'staggered' ? 'var(--import-card-active-bg)' : 'var(--import-card-inactive-bg)',
            border: `1px solid ${strategy === 'staggered' ? 'var(--import-card-active-border)' : 'var(--import-card-inactive-border)'}`,
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
              border: `1px solid ${strategy === 'staggered' ? 'var(--text-white)' : 'var(--text-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            {strategy === 'staggered' && (
              <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--text-white)' }} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-white)' }}>Spread out</span>
              <span
                style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  border: '1px solid var(--import-card-inactive-border)',
                  padding: '1px 5px',
                  borderRadius: 4,
                }}
              >
                RECOMMENDED
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: 0, marginTop: 4, lineHeight: 1.5 }}>
              Revisions are staggered across the next <strong style={{ color: 'var(--text-white)' }}>~{staggeredDays} {staggeredDays === 1 ? 'day' : 'days'}</strong> so you get ~{safePace} problems/day instead of everything hitting at once.
            </p>

            {/* Daily Pace Selector */}
            {strategy === 'staggered' && (
              <div
                className="strategy-pace-box"
                onClick={(e) => e.stopPropagation()}
                style={{
                  marginTop: 10,
                  padding: '8px 12px',
                  background: 'var(--import-counter-bg)',
                  border: '1px solid var(--import-counter-border)',
                  borderRadius: 4,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div className="strategy-pace-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Daily pace:</span>
                  <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: 'var(--text-white)' }}>
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
                          background: safePace === preset ? 'var(--import-card-active-border)' : 'none',
                          color: safePace === preset ? 'var(--text-white)' : 'var(--text-normal)',
                          border: `1px solid ${safePace === preset ? 'var(--import-card-active-border)' : 'var(--import-counter-border)'}`,
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
                      border: '1px solid var(--import-counter-border)',
                      borderRadius: 4,
                      background: 'var(--import-counter-bg)',
                    }}
                  >
                    <button
                      type="button"
                      disabled={safePace <= 1}
                      onClick={() => onDailyPaceChange(Math.max(1, safePace - 1))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: safePace <= 1 ? 'var(--text-faint)' : 'var(--text-normal)',
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
                        color: 'var(--text-white)',
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
                        color: safePace >= 100 ? 'var(--text-faint)' : 'var(--text-normal)',
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
            background: strategy === 'fresh' ? 'var(--import-card-active-bg)' : 'var(--import-card-inactive-bg)',
            border: `1px solid ${strategy === 'fresh' ? 'var(--import-card-active-border)' : 'var(--import-card-inactive-border)'}`,
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
              border: `1px solid ${strategy === 'fresh' ? 'var(--text-white)' : 'var(--text-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            {strategy === 'fresh' && (
              <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--text-white)' }} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-white)' }}>Start fresh</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: 0, marginTop: 4, lineHeight: 1.5 }}>
              All {totalProblems} problems start at Step 0 and get their first revision in <strong style={{ color: 'var(--text-white)' }}>3 days</strong>, just like newly added problems.
            </p>
          </div>
        </div>

        {/* 3. No revisions */}
        <div
          className="strategy-card"
          onClick={() => onStrategyChange('archive')}
          style={{
            background: strategy === 'archive' ? 'var(--import-card-active-bg)' : 'var(--import-card-inactive-bg)',
            border: `1px solid ${strategy === 'archive' ? 'var(--import-card-active-border)' : 'var(--import-card-inactive-border)'}`,
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
              border: `1px solid ${strategy === 'archive' ? 'var(--text-white)' : 'var(--text-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            {strategy === 'archive' && (
              <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--text-white)' }} />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-white)' }}>No revisions</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: 0, marginTop: 4, lineHeight: 1.5 }}>
              Problems are imported as <strong style={{ color: 'var(--text-white)' }}>Mastered</strong>. They stay stored in your archive and will not appear in daily review queues unless reactivated.
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
            border: '1px solid var(--import-back-btn-border)',
            borderRadius: 6,
            color: 'var(--import-back-btn-color)',
            fontSize: 13,
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--import-back-btn-hover-border)'; e.currentTarget.style.color = 'var(--text-white)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--import-back-btn-border)'; e.currentTarget.style.color = 'var(--import-back-btn-color)'; }}
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
