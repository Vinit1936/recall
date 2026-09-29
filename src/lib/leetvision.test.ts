import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLeetVisionSolutionUrl, fetchLeetVisionCompanies, getLeetVisionData } from './leetvision';

describe('leetvision integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getLeetVisionSolutionUrl', () => {
    it('returns the correct visualizer solution url for a problem number', () => {
      expect(getLeetVisionSolutionUrl(11)).toBe('https://leet-vision.com/solution/11');
      expect(getLeetVisionSolutionUrl('42')).toBe('https://leet-vision.com/solution/42');
    });

    it('handles empty or zero gracefully', () => {
      expect(getLeetVisionSolutionUrl(0)).toBe('https://leet-vision.com');
      expect(getLeetVisionSolutionUrl('')).toBe('https://leet-vision.com');
    });
  });

  describe('fetchLeetVisionCompanies', () => {
    it('returns empty array when problem number is invalid', async () => {
      const res = await fetchLeetVisionCompanies(0);
      expect(res).toEqual([]);
    });

    it('fetches companies from leet-vision endpoint', async () => {
      const mockCompanies = ['Amazon', 'Google', 'Meta'];
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompanies,
      } as Response);

      const res = await fetchLeetVisionCompanies(11);
      expect(res).toEqual(mockCompanies);
    });

    it('handles fetch errors gracefully without throwing', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      const res = await fetchLeetVisionCompanies(9999);
      expect(res).toEqual([]);
    });
  });

  describe('getLeetVisionData', () => {
    it('returns both companies and solutionUrl', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ['Apple', 'Microsoft'],
      } as Response);

      const data = await getLeetVisionData(1);
      expect(data.companies).toEqual(['Apple', 'Microsoft']);
      expect(data.solutionUrl).toBe('https://leet-vision.com/solution/1');
    });
  });
});
