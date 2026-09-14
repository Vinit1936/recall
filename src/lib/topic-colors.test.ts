import { describe, expect, it } from 'vitest';
import { getTopicColor } from './topic-colors';

describe('getTopicColor', () => {
  it('returns theme variables for an empty topic', () => {
    expect(getTopicColor('')).toEqual({
      bg: 'var(--muted)',
      text: 'var(--muted-foreground)',
      border: 'var(--border)',
    });
  });

  it('assigns a deterministic theme slot', () => {
    const color = getTopicColor('Binary Search');

    expect(color).toEqual(getTopicColor('Binary Search'));
    expect(color.bg).toMatch(/^var\(--topic-(?:[1-9]|1[0-2])-bg\)$/);
    expect(color.text).toMatch(/^var\(--topic-(?:[1-9]|1[0-2])-text\)$/);
    expect(color.border).toMatch(/^var\(--topic-(?:[1-9]|1[0-2])-border\)$/);
  });

  it('normalizes topic casing and surrounding whitespace', () => {
    expect(getTopicColor('  Two Pointers ')).toEqual(getTopicColor('two pointers'));
  });
});
