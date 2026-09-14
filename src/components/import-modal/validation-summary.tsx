'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { ValidationResult, ImportStrategy } from '@/lib/import-utils';

type ValidationSummaryStepProps = {
  result: ValidationResult;
  strategy: ImportStrategy;
  dailyPace?: number;
  isImporting: boolean;
  importResult: {
    imported: number;
    skipped: number;
    total: number;
    customColumnsCreated?: string[];
  } | null;
  importError: string | null;
  onImport: () => void;
  onBack: () => void;
  onClose: () => void;
};

export function ValidationSummaryStep({
  result,
  strategy,
  dailyPace = 5,
  isImporting,
  importResult,
  importError,
  onImport,
  onBack,
  onClose,
}: ValidationSummaryStepProps) {
  const [warningsOpen, setWarningsOpen] = useState(false);
  const [skippedOpen, setSkippedOpen] = useState(false);

  // Group warnings by message pattern
  const warningCounts: Record<string, number> = {};
  for (const w of result.warnings) {
    const cleanMsg = w.message.replace(/^Row \d+:\s*/, '');
    warningCounts[cleanMsg] = (warningCounts[cleanMsg] || 0) + 1;
  }

  const strategyLabel =
    strategy === 'staggered'
      ? `Spread out (~${dailyPace} problems/day)`
      : strategy === 'fresh'
      ? 'Start fresh (first review in 3 days)'
      : 'Mastered / Archive (no daily reviews)';

  // Success view
  if (importResult) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center', padding: '16px 0' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 500, color: '#fff', margin: 0, marginBottom: 4 }}>
            Import Complete
          </h3>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            Your problems have been saved to your Recall tracker.
          </p>
        </div>

        <div
          style={{
            background: '#121214',
            border: '1px solid #1c1c1e',
            borderRadius: 6,
            padding: '14px 16px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#fff' }}>
              <strong>{importResult.imported.toLocaleString()}</strong> problems imported
            </span>
            <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 11, color: '#888' }}>
              DONE
            </span>
          </div>

          {importResult.customColumnsCreated && importResult.customColumnsCreated.length > 0 && (
            <div style={{ fontSize: 12, color: '#a1a1aa' }}>
              Custom columns created: <span style={{ color: '#d4d4d8' }}>{importResult.customColumnsCreated.join(', ')}</span>
            </div>
          )}

          {importResult.skipped > 0 && (
            <div style={{ fontSize: 12, color: '#a1a1aa' }}>
              {importResult.skipped} duplicate or invalid rows were skipped.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: 'none',
              borderRadius: 6,
              color: '#000000',
              fontSize: 13,
              fontWeight: 500,
              padding: '6px 18px',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Pre-import summary view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: '#fff', margin: 0, marginBottom: 4 }}>
          Review Import Summary
        </h3>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
          Verify rows and columns before saving to your database.
        </p>
      </div>

      {/* Main Details Card */}
      <div
        className="validation-card"
        style={{
          background: '#121214',
          border: '1px solid #1c1c1e',
          borderRadius: 6,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Ready Row */}
        <div className="validation-ready-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
              {result.valid.length.toLocaleString()} {result.valid.length === 1 ? 'problem' : 'problems'} ready to import
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              Schedule: <span style={{ color: '#d4d4d8' }}>{strategyLabel}</span>
            </div>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 11,
              color: '#888',
            }}
          >
            VALIDATED
          </span>
        </div>

        {/* Custom Columns */}
        {result.customColumns && result.customColumns.length > 0 && (
          <div style={{ borderTop: '1px solid #1c1c1e', paddingTop: 10 }}>
            <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>
              {result.customColumns.length} custom {result.customColumns.length === 1 ? 'column' : 'columns'} will be created:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {result.customColumns.map((col) => (
                <span
                  key={col}
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#18181b',
                    border: '1px solid #333',
                    color: '#e4e4e7',
                  }}
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Warnings Collapsible */}
        {result.warnings.length > 0 && (
          <div style={{ borderTop: '1px solid #1c1c1e', paddingTop: 10 }}>
            <div
              onClick={() => setWarningsOpen(!warningsOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>
                {result.warnings.length} warnings (resolved with defaults)
              </span>
              <span style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 2 }}>
                {warningsOpen ? 'hide' : 'show'}
                {warningsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </span>
            </div>

            {warningsOpen && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 100, overflowY: 'auto' }}>
                {Object.entries(warningCounts).map(([msg, count], i) => (
                  <div key={i} style={{ fontSize: 11.5, color: '#a1a1aa', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    • {count}x: {msg}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skipped Collapsible */}
        {result.skipped.length > 0 && (
          <div style={{ borderTop: '1px solid #1c1c1e', paddingTop: 10 }}>
            <div
              onClick={() => setSkippedOpen(!skippedOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>
                {result.skipped.length} problems will be skipped
              </span>
              <span style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 2 }}>
                {skippedOpen ? 'hide' : 'show'}
                {skippedOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </span>
            </div>

            {skippedOpen && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 100, overflowY: 'auto' }}>
                {result.skipped.map((s, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: '#a1a1aa', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    • Row {s.row}: {s.reason.replace(/^Row \d+:\s*/, '')}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {importError && (
        <div style={{ fontSize: 12.5, color: '#f87171', padding: '6px 10px', borderRadius: 4, background: '#1c1212', border: '1px solid #381818' }}>
          {importError}
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <button
          type="button"
          disabled={isImporting}
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid #333',
            borderRadius: 6,
            color: '#d4d4d8',
            fontSize: 13,
            padding: '6px 14px',
            cursor: isImporting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#d4d4d8'; }}
        >
          <ArrowLeft size={13} />
          Back
        </button>

        <button
          type="button"
          disabled={isImporting || result.valid.length === 0}
          onClick={onImport}
          style={{
            background: '#ffffff',
            border: 'none',
            borderRadius: 6,
            color: '#000000',
            fontSize: 13,
            fontWeight: 500,
            padding: '6px 16px',
            cursor: isImporting || result.valid.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: isImporting || result.valid.length === 0 ? 0.6 : 1,
          }}
        >
          {isImporting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Importing...
            </>
          ) : (
            <>
              Import {result.valid.length} Problems
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
