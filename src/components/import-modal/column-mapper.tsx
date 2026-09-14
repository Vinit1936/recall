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
      color: '#71717a',
      bg: 'transparent',
      border: '#27272a',
    };
  }
  if (typeof field === 'string' && field.startsWith('custom:')) {
    return {
      tag: '+ new column',
      color: '#c4b5fd',
      bg: 'rgba(167, 139, 250, 0.08)',
      border: 'rgba(167, 139, 250, 0.25)',
    };
  }
  const found = STANDARD_FIELD_OPTIONS.find((f) => f.value === field);
  return {
    tag: found?.tag || field,
    color: '#d1d5db',
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.12)',
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
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#fff', margin: 0, marginBottom: 4 }}>
            Map Columns
          </h3>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            Match spreadsheet headers to standard problem fields or create custom columns.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: '#888' }}>
          {parsedFile.totalRows} rows in <span style={{ color: '#d4d4d8' }}>{filename}</span>
        </div>
      </div>

      {/* View Segmented Tabs — Declutters the screen */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1c1c20',
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
              color: activeTab === 'mapping' ? '#fff' : '#888',
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
              if (activeTab !== 'mapping') e.currentTarget.style.color = '#ccc';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'mapping') e.currentTarget.style.color = '#888';
            }}
          >
            <span>Column Assignments</span>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 4,
                background: activeTab === 'mapping' ? '#222' : '#18181b',
                color: activeTab === 'mapping' ? '#fff' : '#888',
              }}
            >
              {parsedFile.headers.length}
            </span>
            {activeTab === 'mapping' && (
              <div style={{ position: 'absolute', bottom: -3, left: 0, right: 0, height: 2, background: '#fff' }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'preview' ? '#fff' : '#888',
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
              if (activeTab !== 'preview') e.currentTarget.style.color = '#ccc';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'preview') e.currentTarget.style.color = '#888';
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
                background: activeTab === 'preview' ? '#222' : '#18181b',
                color: activeTab === 'preview' ? '#fff' : '#888',
              }}
            >
              {previewRows.length} rows
            </span>
            {activeTab === 'preview' && (
              <div style={{ position: 'absolute', bottom: -3, left: 0, right: 0, height: 2, background: '#fff' }} />
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
                  border: '1px solid rgba(167, 139, 250, 0.35)',
                  borderRadius: 4,
                  color: '#c4b5fd',
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
                  color: '#888',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#d4d4d8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
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
                  background: isCustom ? '#121016' : currentField === 'skip' ? '#0e0e10' : '#121214',
                  border: `1px solid ${
                    isCustom
                      ? 'rgba(167, 139, 250, 0.25)'
                      : '#1c1c20'
                  }`,
                  gap: 12,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {/* Left: Column Name, Badges & Sample */}
                <div className="column-mapping-left" style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1, paddingRight: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{header}</span>

                    {isAuto && (
                      <span
                        style={{
                          fontFamily: 'var(--font-geist-mono), monospace',
                          fontSize: 9.5,
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: 'transparent',
                          border: '1px solid #333',
                          color: '#a1a1aa',
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
                          border: '1px dashed rgba(167, 139, 250, 0.35)',
                          borderRadius: 3,
                          color: '#c4b5fd',
                          fontSize: 10,
                          padding: '1px 6px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-geist-mono), monospace',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c4b5fd'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.35)'; }}
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
                      <span style={{ color: '#71717a' }}>sample: </span>
                      <span style={{ color: '#d4d4d8' }}>&quot;{sampleVal}&quot;</span>
                    </span>
                  )}
                </div>

                {/* Right: Fixed 220px Uniform Dropdown Column */}
                <div className="column-mapping-right" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#71717a', fontFamily: 'var(--font-geist-mono), monospace', width: 12, textAlign: 'center' }}>
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
                      background: isCustom ? '#181422' : '#161618',
                      border: `1px solid ${
                        isCustom
                          ? '#6b21a8'
                          : '#2e2e32'
                      }`,
                      borderRadius: 4,
                      color: isCustom ? '#e9d5ff' : currentField === 'skip' ? '#888' : '#fff',
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
            border: '1px solid #1c1c1c',
            background: '#0c0c0c',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1c1c1c', height: 32, background: '#111' }}>
                <th style={{ width: 36, padding: '0 8px', color: '#71717a', textAlign: 'center', borderRight: '1px solid #1c1c1c' }}>#</th>
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
                        color: isSkip ? '#71717a' : isCustom ? '#c4b5fd' : '#fff',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        borderRight: i < parsedFile.headers.length - 1 ? '1px solid #1c1c1c' : 'none',
                      }}
                    >
                      <div>{h}</div>
                      <div style={{ fontSize: 9.5, color: isSkip ? '#71717a' : isCustom ? '#c4b5fd' : '#a1a1aa', textTransform: 'none' }}>
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
                    borderBottom: rIdx < previewRows.length - 1 ? '1px solid #161616' : 'none',
                    height: 28,
                  }}
                >
                  <td style={{ textAlign: 'center', color: '#71717a', borderRight: '1px solid #1c1c1c', fontSize: 11, fontFamily: 'monospace' }}>
                    {rIdx + 1}
                  </td>
                  {parsedFile.headers.map((h, cIdx) => {
                    const val = row[h] || '';
                    return (
                      <td
                        key={cIdx}
                        style={{
                          padding: '0 12px',
                          color: val ? '#d4d4d8' : '#52525b',
                          whiteSpace: 'nowrap',
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontFamily: 'var(--font-geist-mono), monospace',
                          fontSize: 11.5,
                          borderRight: cIdx < parsedFile.headers.length - 1 ? '1px solid #161616' : 'none',
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
            background: '#1c1212',
            border: '1px solid #381818',
            borderRadius: 6,
            padding: '8px 12px',
            color: '#f87171',
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
            color: '#c4b5fd',
            padding: '7px 12px',
            borderRadius: 6,
            background: 'rgba(167, 139, 250, 0.05)',
            border: '1px solid rgba(167, 139, 250, 0.18)',
          }}
        >
          <Sparkles size={13} style={{ color: '#c4b5fd', flexShrink: 0 }} />
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
            border: '1px solid #333',
            borderRadius: 6,
            color: '#d4d4d8',
            fontSize: 13,
            padding: '6px 14px',
            cursor: 'pointer',
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
          disabled={!isTitleMapped}
          onClick={() => onMappingConfirmed(mapping)}
          style={{
            background: isTitleMapped ? '#ffffff' : '#222',
            border: 'none',
            borderRadius: 6,
            color: isTitleMapped ? '#000000' : '#555',
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
