'use client';

import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Table,
  Sparkles,
} from 'lucide-react';
import type { ParsedFile, ColumnMapping, RecallField } from '@/lib/import-utils';

type ColumnMapperStepProps = {
  parsedFile: ParsedFile;
  filename: string;
  initialMapping: ColumnMapping;
  existingCustomColumns?: string[];
  onMappingConfirmed: (mapping: ColumnMapping) => void;
  onBack: () => void;
};

const STANDARD_FIELD_OPTIONS: { value: RecallField; label: string; tag: string; required?: boolean }[] = [
  { value: 'title', label: 'Title', tag: 'TITLE *', required: true },
  { value: 'problemNumber', label: 'Problem Number', tag: 'NUMBER' },
  { value: 'platform', label: 'Platform', tag: 'PLATFORM' },
  { value: 'difficulty', label: 'Difficulty', tag: 'DIFFICULTY' },
  { value: 'topic', label: 'Topic / Tags', tag: 'TOPIC' },
  { value: 'url', label: 'Problem URL', tag: 'URL' },
  { value: 'dateSolved', label: 'Date Solved', tag: 'DATE' },
  { value: 'notes', label: 'Notes', tag: 'NOTES' },
];

function getFieldBadge(field: RecallField) {
  if (field === 'skip') {
    return {
      tag: 'skip',
      color: 'var(--muted-foreground)',
      bg: 'transparent',
      border: 'var(--input-border)',
    };
  }
  if (typeof field === 'string' && field.startsWith('custom:')) {
    return {
      tag: '+ new column',
      color: 'var(--import-accent)',
      bg: 'var(--import-accent-bg)',
      border: 'var(--import-accent-border)',
    };
  }
  const found = STANDARD_FIELD_OPTIONS.find((f) => f.value === field);
  return {
    tag: found?.tag || field,
    color: 'var(--foreground)',
    bg: 'var(--muted)',
    border: 'var(--border)',
  };
}

export function ColumnMapperStep({
  parsedFile,
  filename,
  initialMapping,
  existingCustomColumns = [],
  onMappingConfirmed,
  onBack,
}: ColumnMapperStepProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);
  const [activeTab, setActiveTab] = useState<'mapping' | 'preview'>('mapping');

  // Derive which standard Recall fields are mapped
  const mappedStandardFields = new Set<RecallField>();
  const customColumnsSet = new Set<string>();

  for (const field of Object.values(mapping)) {
    if (field !== 'skip') {
      if (typeof field === 'string' && field.startsWith('custom:')) {
        customColumnsSet.add(field.slice(7));
      } else {
        mappedStandardFields.add(field);
      }
    }
  }

  const isTitleMapped = mappedStandardFields.has('title');
  const isPlatformMapped = mappedStandardFields.has('platform');

  const handleFieldChange = (header: string, selectedField: RecallField) => {
    setMapping((prev) => ({
      ...prev,
      [header]: selectedField,
    }));
  };

  const handleMapAllUnmappedToCustom = () => {
    setMapping((prev) => {
      const updated = { ...prev };
      for (const header of parsedFile.headers) {
        if (!updated[header] || updated[header] === 'skip') {
          updated[header] = `custom:${header}` as RecallField;
        }
      }
      return updated;
    });
  };

  const handleResetCustomToSkip = () => {
    setMapping((prev) => {
      const updated = { ...prev };
      for (const header of parsedFile.headers) {
        if (typeof updated[header] === 'string' && updated[header].startsWith('custom:')) {
          updated[header] = 'skip';
        }
      }
      return updated;
    });
  };

  const previewRows = parsedFile.rows.slice(0, 5);
  const unmappedCount = parsedFile.headers.filter((h) => !mapping[h] || mapping[h] === 'skip').length;
  const customColumnsCount = customColumnsSet.size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--foreground)', margin: 0, marginBottom: 4 }}>
            Map Columns
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>
            Match spreadsheet headers to standard problem fields or create custom columns.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: 'var(--muted-foreground)' }}>
          {parsedFile.totalRows} rows in <span style={{ color: 'var(--foreground)' }}>{filename}</span>
        </div>
      </div>

      {/* View Segmented Tabs — Declutters the screen */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 2,
        }}
      >
        <div className="column-mapping-tabs" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            type="button"
            onClick={() => setActiveTab('mapping')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'mapping' ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 13,
              fontWeight: activeTab === 'mapping' ? 500 : 400,
              cursor: 'pointer',
              padding: '6px 0',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'mapping') e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'mapping') e.currentTarget.style.color = 'var(--muted-foreground)';
            }}
          >
            <span>Column Assignments</span>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 4,
                background: activeTab === 'mapping' ? 'var(--accent)' : 'var(--muted)',
                color: activeTab === 'mapping' ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              {parsedFile.headers.length}
            </span>
            {activeTab === 'mapping' && (
              <div style={{ position: 'absolute', bottom: -3, left: 0, right: 0, height: 2, background: 'var(--primary)' }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'preview' ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 13,
              fontWeight: activeTab === 'preview' ? 500 : 400,
              cursor: 'pointer',
              padding: '6px 0',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'preview') e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'preview') e.currentTarget.style.color = 'var(--muted-foreground)';
            }}
          >
            <Table size={13} style={{ opacity: 0.8 }} />
            <span>Raw Data Preview</span>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 4,
                background: activeTab === 'preview' ? 'var(--accent)' : 'var(--muted)',
                color: activeTab === 'preview' ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              {previewRows.length} rows
            </span>
            {activeTab === 'preview' && (
              <div style={{ position: 'absolute', bottom: -3, left: 0, right: 0, height: 2, background: 'var(--primary)' }} />
            )}
          </button>
        </div>

        {activeTab === 'mapping' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {unmappedCount > 0 && (
              <button
                type="button"
                onClick={handleMapAllUnmappedToCustom}
                style={{
                  background: 'none',
                  border: '1px solid var(--import-accent-border)',
                  borderRadius: 4,
                  color: 'var(--import-accent)',
                  fontSize: 11,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus size={11} />
                Map {unmappedCount} as custom
              </button>
            )}
            {customColumnsCount > 0 && (
              <button
                type="button"
                onClick={handleResetCustomToSkip}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}
              >
                Reset custom
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab 1: Column Assignments (Clean, Minimal & Controlled) */}
      {activeTab === 'mapping' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 330,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {parsedFile.headers.map((header) => {
            const currentField = mapping[header] || 'skip';
            const isAuto = initialMapping[header] && initialMapping[header] !== 'skip';
            const isCustom = typeof currentField === 'string' && currentField.startsWith('custom:');
            const sampleVal = parsedFile.rows[0]?.[header] || '';
            const badge = getFieldBadge(currentField);

            return (
              <div
                key={header}
                className="column-mapping-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: isCustom ? 'var(--import-accent-bg)' : currentField === 'skip' ? 'var(--background)' : 'var(--card)',
                  border: `1px solid ${
                    isCustom
                      ? 'var(--import-accent-border)'
                      : 'var(--border)'
                  }`,
                  gap: 12,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {/* Left: Column Name, Badges & Sample */}
                <div className="column-mapping-left" style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1, paddingRight: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{header}</span>

                    {isAuto && (
                      <span
                        style={{
                          fontFamily: 'var(--font-geist-mono), monospace',
                          fontSize: 9.5,
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: 'transparent',
                          border: '1px solid var(--input-border)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        auto
                      </span>
                    )}

                    {/* Subtle Semantic Badge */}
                    <span
                      style={{
                        fontFamily: 'var(--font-geist-mono), monospace',
                        fontSize: 9.5,
                        padding: '1px 6px',
                        borderRadius: 3,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                        fontWeight: 500,
                      }}
                    >
                      {badge.tag}
                    </span>

                    {currentField === 'skip' && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange(header, `custom:${header}` as RecallField)}
                        style={{
                          background: 'none',
                          border: '1px dashed var(--import-accent-border)',
                          borderRadius: 3,
                          color: 'var(--import-accent)',
                          fontSize: 10,
                          padding: '1px 6px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-geist-mono), monospace',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--import-accent)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--import-accent-border)'; }}
                      >
                        + as column
                      </button>
                    )}
                  </div>

                  {sampleVal && (
                    <span
                      style={{
                        fontFamily: 'var(--font-geist-mono), monospace',
                        fontSize: 11,
                        maxWidth: 280,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ color: 'var(--muted-foreground)' }}>sample: </span>
                      <span style={{ color: 'var(--foreground)' }}>&quot;{sampleVal}&quot;</span>
                    </span>
                  )}
                </div>

                {/* Right: Fixed 220px Uniform Dropdown Column */}
                <div className="column-mapping-right" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-geist-mono), monospace', width: 12, textAlign: 'center' }}>
                    →
                  </span>

                  <select
                    className="column-mapping-select"
                    value={currentField}
                    onChange={(e) => handleFieldChange(header, e.target.value as RecallField)}
                    style={{
                      width: 220,
                      minWidth: 220,
                      maxWidth: 220,
                      flexShrink: 0,
                      background: isCustom ? 'var(--import-accent-bg)' : 'var(--input-bg)',
                      border: `1px solid ${
                        isCustom
                          ? 'var(--import-accent)'
                          : 'var(--input-border)'
                      }`,
                      borderRadius: 4,
                      color: isCustom ? 'var(--import-accent)' : currentField === 'skip' ? 'var(--muted-foreground)' : 'var(--foreground)',
                      fontSize: 12,
                      padding: '5px 8px',
                      outline: 'none',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box',
                    }}
                  >
                    <optgroup label="Standard Fields">
                      {STANDARD_FIELD_OPTIONS.map((opt) => {
                        const isAssignedElsewhere =
                          opt.value !== 'skip' &&
                          opt.value !== currentField &&
                          mappedStandardFields.has(opt.value);

                        return (
                          <option key={opt.value} value={opt.value} disabled={isAssignedElsewhere}>
                            {opt.label} {opt.required ? '*' : ''} {isAssignedElsewhere ? '(mapped)' : ''}
                          </option>
                        );
                      })}
                    </optgroup>

                    {existingCustomColumns.length > 0 && (
                      <optgroup label="Existing Custom Columns">
                        {existingCustomColumns.map((col) => (
                          <option key={col} value={`custom:${col}`}>
                            Custom: {col}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <optgroup label="New Custom Column">
                      <option value={`custom:${header}`}>+ Create Column &quot;{header}&quot;</option>
                    </optgroup>

                    <optgroup label="Ignore">
                      <option value="skip">— Do not import —</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Raw Spreadsheet Data Preview */}
      {activeTab === 'preview' && (
        <div
          style={{
            maxHeight: 330,
            overflowX: 'auto',
            overflowY: 'auto',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--background)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', height: 32, background: 'var(--card)' }}>
                <th style={{ width: 36, padding: '0 8px', color: 'var(--muted-foreground)', textAlign: 'center', borderRight: '1px solid var(--border)' }}>#</th>
                {parsedFile.headers.map((h, i) => {
                  const target = mapping[h] || 'skip';
                  const isCustom = typeof target === 'string' && target.startsWith('custom:');
                  const isSkip = target === 'skip';

                  return (
                    <th
                      key={i}
                      style={{
                        padding: '6px 12px',
                        fontFamily: 'var(--font-geist-mono), monospace',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: isSkip ? 'var(--muted-foreground)' : isCustom ? 'var(--import-accent)' : 'var(--foreground)',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        borderRight: i < parsedFile.headers.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div>{h}</div>
                      <div style={{ fontSize: 9.5, color: isSkip ? 'var(--muted-foreground)' : isCustom ? 'var(--import-accent)' : 'var(--muted-foreground)', textTransform: 'none' }}>
                        {isSkip ? '— skip' : isCustom ? `✦ ${target.slice(7)}` : `→ ${target}`}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: rIdx < previewRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    height: 28,
                  }}
                >
                  <td style={{ textAlign: 'center', color: 'var(--muted-foreground)', borderRight: '1px solid var(--border)', fontSize: 11, fontFamily: 'monospace' }}>
                    {rIdx + 1}
                  </td>
                  {parsedFile.headers.map((h, cIdx) => {
                    const val = row[h] || '';
                    return (
                      <td
                        key={cIdx}
                        style={{
                          padding: '0 12px',
                          color: val ? 'var(--foreground)' : 'var(--muted-foreground)',
                          whiteSpace: 'nowrap',
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontFamily: 'var(--font-geist-mono), monospace',
                          fontSize: 11.5,
                          borderRight: cIdx < parsedFile.headers.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        }}
                        title={val}
                      >
                        {val || '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dynamic Summary Cards */}
      {!isTitleMapped && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            borderRadius: 6,
            padding: '8px 12px',
            color: 'var(--error)',
            fontSize: 12.5,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>Please map at least one column to <strong>Title *</strong> to proceed.</span>
        </div>
      )}

      {customColumnsCount > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 11.5,
            color: 'var(--import-accent)',
            padding: '7px 12px',
            borderRadius: 6,
            background: 'var(--import-accent-bg)',
            border: '1px solid var(--import-accent-border)',
          }}
        >
          <Sparkles size={13} style={{ color: 'var(--import-accent)', flexShrink: 0 }} />
          <span>
            {customColumnsCount} custom {customColumnsCount === 1 ? 'column' : 'columns'} will be created: {Array.from(customColumnsSet).join(', ')}
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
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
          disabled={!isTitleMapped}
          onClick={() => onMappingConfirmed(mapping)}
          style={{
            background: isTitleMapped ? 'var(--primary)' : 'var(--muted)',
            border: 'none',
            borderRadius: 6,
            color: isTitleMapped ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            fontSize: 13,
            fontWeight: 500,
            padding: '6px 16px',
            cursor: isTitleMapped ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Continue
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
