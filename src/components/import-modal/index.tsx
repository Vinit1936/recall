import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { X } from 'lucide-react';
import { FileUploadStep } from './file-upload';
import { ColumnMapperStep } from './column-mapper';
import { StrategyPickerStep } from './strategy-picker';
import { ValidationSummaryStep } from './validation-summary';
import {
  autoDetectMappings,
  validateAndProcessRows,
  type ParsedFile,
  type ColumnMapping,
  type ImportStrategy,
  type ValidationResult,
  type Platform,
} from '@/lib/import-utils';

type ImportModalProps = {
  open: boolean;
  onClose: () => void;
  onImportComplete: (result: {
    imported: number;
    skipped: number;
    total: number;
    customColumnsCreated?: string[];
  }) => void;
};

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Map Columns' },
  { id: 3, label: 'Schedule' },
  { id: 4, label: 'Review & Import' },
];

export function ImportModal({ open, onClose, onImportComplete }: ImportModalProps) {
  const { data: rawCols } = useSWR('/api/columns', fetcher);
  const existingCustomColumns: string[] = Array.isArray(rawCols) ? rawCols.map((c: any) => c.name) : [];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [strategy, setStrategy] = useState<ImportStrategy>('staggered');
  const [dailyPace, setDailyPace] = useState<number>(5);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    total: number;
    customColumnsCreated?: string[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Read default platform from localStorage if available
  const getDefaultPlatform = (): Platform => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recall_default_platform');
      if (saved && ['LEETCODE', 'CODEFORCES', 'GFG', 'HACKERRANK', 'CODECHEF'].includes(saved)) {
        return saved as Platform;
      }
    }
    return 'LEETCODE';
  };

  // Close on ESC key (only if not actively importing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isImporting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isImporting, onClose]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setStep(1);
      setParsedFile(null);
      setFilename('');
      setColumnMapping({});
      setStrategy('staggered');
      setDailyPace(5);
      setValidationResult(null);
      setIsImporting(false);
      setImportResult(null);
      setImportError(null);
    }
  }, [open]);

  // Step 1: File parsed
  const handleFileParsed = (result: ParsedFile, name: string) => {
    setParsedFile(result);
    setFilename(name);
    const initialMap = autoDetectMappings(result.headers, existingCustomColumns);
    setColumnMapping(initialMap);
    setStep(2);
  };

  // Step 2: Mapping confirmed
  const handleMappingConfirmed = (mapping: ColumnMapping) => {
    setColumnMapping(mapping);
    setStep(3);
  };

  // Step 3 -> Step 4: Run validation pipeline
  const handleStrategyContinue = async () => {
    if (!parsedFile) return;
    const defaultPlatform = getDefaultPlatform();
    const result = await validateAndProcessRows(
      parsedFile,
      columnMapping,
      strategy,
      defaultPlatform,
      new Date(),
      dailyPace
    );
    setValidationResult(result);
    setStep(4);
  };

  // Step 4: Execute API import
  const handleExecuteImport = async () => {
    if (!validationResult || validationResult.valid.length === 0) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const res = await fetch('/api/problems/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problems: validationResult.valid,
          customColumns: validationResult.customColumns,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server returned an error while importing');
      }

      const data = await res.json();
      setImportResult(data);
      onImportComplete(data);
    } catch (err: any) {
      console.error('Import error:', err);
      setImportError(err?.message || 'Failed to import problems. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="import-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => {
              if (!isImporting) onClose();
            }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--overlay)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            className="import-modal-container"
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: step === 2 ? 820 : 580,
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-modal)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '90vh',
              zIndex: 1,
              transition: 'max-width 0.2s ease',
            }}
          >
            {/* Modal Header — matches dashboard breadcrumbs */}
            <div
              className="import-modal-header"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--popover)',
              }}
            >
              {/* Monospace Breadcrumb */}
              <div className="import-modal-breadcrumb" style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13, display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>recall</span>
                <span style={{ color: 'var(--border)', margin: '0 6px' }}>/</span>
                <span style={{ color: 'var(--muted-foreground)' }}>import</span>
                <span style={{ color: 'var(--border)', margin: '0 6px' }}>/</span>
                <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                  {STEPS.find((s) => s.id === step)?.label}
                </span>
              </div>

              {/* Step indicator & Close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  className="import-modal-step-tag"
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 11,
                    color: 'var(--muted-foreground)',
                    letterSpacing: '0.04em',
                  }}
                >
                  STEP {step} / {STEPS.length}
                </span>

                <div style={{ width: 1, height: 12, background: 'var(--border)' }} />

                <button
                  type="button"
                  disabled={isImporting}
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted-foreground)',
                    cursor: isImporting ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="import-modal-body" style={{ padding: '20px 24px', overflowY: 'auto' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {step === 1 && (
                    <FileUploadStep
                      onFileParsed={handleFileParsed}
                      onCancel={onClose}
                    />
                  )}

                  {step === 2 && parsedFile && (
                    <ColumnMapperStep
                      parsedFile={parsedFile}
                      filename={filename}
                      initialMapping={columnMapping}
                      existingCustomColumns={existingCustomColumns}
                      onMappingConfirmed={handleMappingConfirmed}
                      onBack={() => setStep(1)}
                    />
                  )}

                  {step === 3 && parsedFile && (
                    <StrategyPickerStep
                      strategy={strategy}
                      onStrategyChange={setStrategy}
                      dailyPace={dailyPace}
                      onDailyPaceChange={setDailyPace}
                      totalProblems={parsedFile.totalRows}
                      onContinue={handleStrategyContinue}
                      onBack={() => setStep(2)}
                    />
                  )}

                  {step === 4 && validationResult && (
                    <ValidationSummaryStep
                      result={validationResult}
                      strategy={strategy}
                      dailyPace={dailyPace}
                      isImporting={isImporting}
                      importResult={importResult}
                      importError={importError}
                      onImport={handleExecuteImport}
                      onBack={() => setStep(3)}
                      onClose={onClose}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
