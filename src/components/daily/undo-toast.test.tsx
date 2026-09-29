import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { UndoToast } from './undo-toast';

describe('UndoToast component', () => {
  it('renders nothing when toast is null', () => {
    const markup = renderToStaticMarkup(
      <UndoToast toast={null} onUndo={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(markup).toBe('');
  });

  it('renders toast with title, status and undo button', () => {
    const toast = {
      id: 'toast-1',
      problemId: 'p-1',
      title: 'Reverse Linked List',
      confidence: 'CLEAN' as const,
    };

    const markup = renderToStaticMarkup(
      <UndoToast toast={toast} onUndo={vi.fn()} onDismiss={vi.fn()} />
    );

    expect(markup).toContain('Reverse Linked List');
    expect(markup).toContain('Marked as');
    expect(markup).toContain('Clean');
    expect(markup).toContain('Undo');
  });

  it('renders correctly for SHAKY and STRUGGLED', () => {
    const toastShaky = {
      id: 'toast-2',
      problemId: 'p-2',
      title: 'Merge Intervals',
      confidence: 'SHAKY' as const,
    };
    const markupShaky = renderToStaticMarkup(
      <UndoToast toast={toastShaky} onUndo={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(markupShaky).toContain('Merge Intervals');
    expect(markupShaky).toContain('Shaky');

    const toastStruggled = {
      id: 'toast-3',
      problemId: 'p-3',
      title: 'Binary Tree Maximum Path Sum',
      confidence: 'STRUGGLED' as const,
    };
    const markupStruggled = renderToStaticMarkup(
      <UndoToast toast={toastStruggled} onUndo={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(markupStruggled).toContain('Binary Tree Maximum Path Sum');
    expect(markupStruggled).toContain('Struggled');
  });
});
