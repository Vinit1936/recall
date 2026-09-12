import { describe, it, expect } from 'vitest';
import { leetcodeResolver } from './leetcode';

describe('LeetCode resolver', () => {
  it('resolves problem 1 (Two Sum)', async () => {
    const result = await leetcodeResolver.resolve('1');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.problemNumber).toBe(1);
      expect(result.data.title).toBe('Two Sum');
      expect(result.data.difficulty).toBe('EASY');
      expect(result.data.url).toContain('https://leetcode.com/problems/');
      expect(result.data.topic).toBeTruthy();
    }
  });

  it('resolves problem 234 (Palindrome Linked List)', async () => {
    const result = await leetcodeResolver.resolve('234');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.title).toBe('Palindrome Linked List');
      expect(result.data.difficulty).toBe('EASY');
    }
  });

  it('resolves a Medium problem with correct difficulty', async () => {
    const result = await leetcodeResolver.resolve('2');
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.data.difficulty).toBe('MEDIUM');
    }
  });

  it('returns found: false for invalid number', async () => {
    const result = await leetcodeResolver.resolve('99999');
    expect(result.found).toBe(false);
  });

  it('returns found: false for non-numeric input', async () => {
    const result = await leetcodeResolver.resolve('abc');
    expect(result.found).toBe(false);
  });

  it('topic is a non-empty string', async () => {
    const result = await leetcodeResolver.resolve('1');
    if (result.found) {
      expect(typeof result.data.topic).toBe('string');
      expect(result.data.topic.length).toBeGreaterThan(0);
    }
  });

  it('url starts with https://leetcode.com/problems/', async () => {
    const result = await leetcodeResolver.resolve('1');
    if (result.found) {
      expect(result.data.url).toMatch(/^https:\/\/leetcode\.com\/problems\//);
    }
  });
});
