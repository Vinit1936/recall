import { describe, it, expect } from 'vitest';
import { gfgResolver } from './gfg';

describe('GFG resolver', () => {
  it('resolves problem by URL ("https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1")', async () => {
    const result = await gfgResolver.resolve('https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe("Kadane's Algorithm");
      expect(result.data.difficulty).toBe('MEDIUM');
    }
  });

  it('resolves problem by code ("GFG_001")', async () => {
    const result = await gfgResolver.resolve('GFG_001');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Subarray with Given Sum');
    }
  });

  it('dynamically parses arbitrary GFG problem URL', async () => {
    const result = await gfgResolver.resolve('https://www.geeksforgeeks.org/problems/binary-search-1587115620/1');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Binary Search');
      expect(result.data.url).toBe('https://www.geeksforgeeks.org/problems/binary-search-1587115620/1');
    }
  });
});
