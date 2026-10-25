import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CompletedSection } from './completed-section';
import { CompletedRow } from './completed-row';

describe('CompletedSection component', () => {
  const mockProblem = {
    id: 'p1',
    title: 'Two Sum',
    problemNumber: 1,
    platform: 'LEETCODE',
    difficulty: 'EASY',
    topic: 'Arrays',
    url: 'https://leetcode.com/problems/two-sum',
    latestRevision: {
      id: 'rev-1',
      confidence: 'CLEAN' as const,
      type: 'REGULAR',
    },
  };

  it('renders nothing when problems array is empty', () => {
    const markup = renderToStaticMarkup(
      <CompletedSection
        problems={[]}
        onUndo={vi.fn()}
        onChangeConfidence={vi.fn()}
      />
    );
    expect(markup).toBe('');
  });

  it('renders section title and count when problems exist', () => {
    const markup = renderToStaticMarkup(
      <CompletedSection
        problems={[mockProblem]}
        onUndo={vi.fn()}
        onChangeConfidence={vi.fn()}
      />
    );
    expect(markup).toContain('Completed Today');
    expect(markup).toContain('Two Sum');
    expect(markup).toContain('Easy');
    expect(markup).toContain('Clean');
    expect(markup).toContain('Undo');
  });

  it('renders multiple completed problems', () => {
    const prob2 = {
      ...mockProblem,
      id: 'p2',
      title: 'Valid Anagram',
      problemNumber: 242,
      difficulty: 'MEDIUM',
      topic: 'Hash Table',
      latestRevision: {
        id: 'rev-2',
        confidence: 'SHAKY' as const,
        type: 'REGULAR',
      },
    };

    const markup = renderToStaticMarkup(
      <CompletedSection
        problems={[mockProblem, prob2]}
        onUndo={vi.fn()}
        onChangeConfidence={vi.fn()}
      />
    );
    expect(markup).toContain('Two Sum');
    expect(markup).toContain('Valid Anagram');
    expect(markup).toContain('Clean');
    expect(markup).toContain('Shaky');
  });
});

describe('CompletedRow component', () => {
  const mockProblem = {
    id: 'p1',
    title: 'LRU Cache',
    problemNumber: 146,
    platform: 'LEETCODE',
    difficulty: 'HARD',
    topic: 'Design',
    url: 'https://leetcode.com/problems/lru-cache',
    latestRevision: {
      id: 'rev-1',
      confidence: 'STRUGGLED' as const,
      type: 'REGULAR',
    },
  };

  it('renders problem details, status badge, and undo button', () => {
    const markup = renderToStaticMarkup(
      <CompletedRow
        problem={mockProblem}
        onUndo={vi.fn()}
        onChangeConfidence={vi.fn()}
      />
    );

    expect(markup).toContain('LRU Cache');
    expect(markup).toContain('146');
    expect(markup).toContain('Hard');
    expect(markup).toContain('Struggled');
    expect(markup).toContain('Undo');
  });
});
