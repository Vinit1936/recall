import { describe, it, expect } from 'vitest';
import { codeforcesResolver } from './codeforces';

describe('Codeforces resolver', () => {
  it('resolves problem 4A (Watermelon)', async () => {
    const result = await codeforcesResolver.resolve('4A');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Watermelon');
      expect(result.data.difficulty).toBe('EASY');
      expect(result.data.url).toBe('https://codeforces.com/problemset/problem/4/A');
      expect(result.data.problemNumber).toBe(401);
    }
  });

  it('resolves problem case-insensitively (4a)', async () => {
    const result = await codeforcesResolver.resolve('4a');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Watermelon');
    }
  });

  it('resolves problem 158A (Next Round)', async () => {
    const result = await codeforcesResolver.resolve('158A');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Next Round');
      expect(result.data.difficulty).toBe('EASY');
    }
  });

  it('resolves problem by numeric ID (401)', async () => {
    const result = await codeforcesResolver.resolve('401');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Watermelon');
    }
  });

  it('returns found: false for invalid code', async () => {
    const result = await codeforcesResolver.resolve('999999Z');
    expect(result.found).toBe(false);
  });
});
