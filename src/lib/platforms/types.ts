// Types shared across all platform resolvers.
// Each platform (LeetCode, Codeforces, etc.) implements PlatformResolver.

export type ProblemMeta = {
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  url: string;
  problemNumber?: number;
  code?: string;
};

export type ResolveResult =
  | { found: true; data: ProblemMeta }
  | { found: false };

export interface PlatformResolver {
  resolve(identifier: string): Promise<ResolveResult>;
}
