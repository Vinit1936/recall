import { describe, it, expect } from 'vitest';
import { hackerrankResolver } from './hackerrank';

describe('HackerRank resolver', () => {
  it('resolves challenge by URL ("https://www.hackerrank.com/challenges/solve-me-first/problem")', async () => {
    const result = await hackerrankResolver.resolve('https://www.hackerrank.com/challenges/solve-me-first/problem');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Solve Me First');
      expect(result.data.difficulty).toBe('EASY');
    }
  });

  it('resolves challenge by code ("HR_002")', async () => {
    const result = await hackerrankResolver.resolve('HR_002');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Simple Array Sum');
    }
  });

  it('dynamically parses arbitrary HackerRank challenge URL', async () => {
    const result = await hackerrankResolver.resolve('https://www.hackerrank.com/challenges/matrix-rotation-algo/problem');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Matrix Rotation Algo');
      expect(result.data.url).toBe('https://www.hackerrank.com/challenges/matrix-rotation-algo/problem');
    }
  });
});
