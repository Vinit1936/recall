import { describe, it, expect } from 'vitest';
import { codechefResolver } from './codechef';

describe('CodeChef resolver', () => {
  it('resolves problem FLOW001 (Add Two Numbers)', async () => {
    const result = await codechefResolver.resolve('FLOW001');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Add Two Numbers');
      expect(result.data.difficulty).toBe('EASY');
      expect(result.data.url).toBe('https://www.codechef.com/problems/FLOW001');
    }
  });

  it('resolves problem case-insensitively (flow001)', async () => {
    const result = await codechefResolver.resolve('flow001');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Add Two Numbers');
    }
  });

  it('resolves problem START01 (Number Mirror)', async () => {
    const result = await codechefResolver.resolve('START01');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.difficulty).toBe('EASY');
      expect(result.data.url).toBe('https://www.codechef.com/problems/START01');
    }
  });

  it('resolves problem HS08TEST (ATM)', async () => {
    const result = await codechefResolver.resolve('HS08TEST');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('ATM');
    }
  });

  it('returns found: false for invalid code', async () => {
    const result = await codechefResolver.resolve('NOTAVALIDPROBLEMXYZ999');
    expect(result.found).toBe(false);
  });

  it('returns found: false for empty string', async () => {
    const result = await codechefResolver.resolve('');
    expect(result.found).toBe(false);
  });
});
