'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { detectFileType, parseCsvFile, parseExcelFile, type ParsedFile } from '@/lib/import-utils';

type FileUploadStepProps = {
  onFileParsed: (result: ParsedFile, filename: string) => void;
  onCancel: () => void;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS = 1000;

export function FileUploadStep({ onFileParsed, onCancel }: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);

    // 1. File size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File too large. Maximum allowed size is 5 MB.');
      return;
    }

    // 2. File type check
    const type = detectFileType(file);
    if (type === 'unsupported') {
      setError('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    setIsParsing(true);
    try {
      let parsed: ParsedFile;
      if (type === 'csv') {
        parsed = await parseCsvFile(file);
      } else {
        parsed = await parseExcelFile(file);
      }

      if (!parsed.headers || parsed.headers.length === 0) {
        setError('No column headers detected in the file.');
        return;
      }

      if (parsed.totalRows === 0) {
        setError('No data rows found below the header row.');
        return;
      }

      if (parsed.totalRows > MAX_ROWS) {
        setError(`Too many rows (${parsed.totalRows.toLocaleString()} found). Limit is ${MAX_ROWS}.`);
        return;
      }

      onFileParsed(parsed, file.name);
    } catch (err: any) {
      console.error('Failed to parse spreadsheet:', err);
      setError(err?.message || 'Failed to parse spreadsheet.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: '#fff', margin: 0, marginBottom: 4 }}>
          Upload Problem List
        </h3>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
          Import problems from a CSV or Excel spreadsheet into your Recall tracker.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Minimalist Dropzone */}
      <div
        className="import-dropzone"
        onClick={() => !isParsing && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `1px dashed ${isDragging ? '#888' : '#333'}`,
          borderRadius: 6,
          background: isDragging ? '#171717' : '#121214',
          padding: '44px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          cursor: isParsing ? 'wait' : 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) e.currentTarget.style.borderColor = '#4f4f56';
        }}
        onMouseLeave={(e) => {
          if (!isDragging) e.currentTarget.style.borderColor = '#333';
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            background: '#18181b',
            border: '1px solid #2e2e32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a1a1aa',
          }}
        >
          {isParsing ? (
            <Loader2 size={18} className="animate-spin" style={{ color: '#aaa' }} />
          ) : (
            <FileSpreadsheet size={18} />
          )}
        </div>

        {isParsing ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#ccc' }}>Reading spreadsheet...</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#f4f4f5', fontWeight: 500 }}>
              Click to select a file <span style={{ color: '#a1a1aa', fontWeight: 400 }}>or drag and drop</span>
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: '#888',
                marginTop: 4,
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              Supports .csv, .xlsx, .xls • Up to 5 MB (1,000 rows max)
            </div>
          </div>
        )}
      </div>

      {error && (
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
          <span>{error}</span>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border: '1px solid #333',
            borderRadius: 6,
            color: '#d4d4d8',
            fontSize: 13,
            padding: '6px 14px',
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#555';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.color = '#d4d4d8';
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
