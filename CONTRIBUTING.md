# Contributing to recall.

Thanks for considering contributing — this is a solo-built but actively maintained project, and genuine contributions are welcome, not just tolerated.

## Before you start

For anything beyond a small fix (typo, small bug, minor style tweak), **open an issue first** describing what you want to change and why. This avoids spending time on a PR that doesn't fit the project's direction. For small fixes, feel free to just open the PR directly.

## Ways to contribute

- **Bug reports** — if something's broken, open an issue with steps to reproduce, what you expected, and what actually happened. Screenshots help a lot.
- **Feature suggestions** — open an issue describing the use case, not just the feature. "I want X" is less useful than "I'm trying to do Y and there's no way to do it."
- **Code contributions** — see setup below.
- **Adding a new platform resolver** — see the dedicated guide below, this is one of the most valuable and self-contained contributions possible.
- **Documentation** — fixing unclear explanations, adding examples, improving the README.

## Development setup

```bash
git clone https://github.com/Vinit1936/Recall.git
cd Recall
npm install
```

You'll need a Neon Postgres database (free tier is fine) for local development:

```env
DATABASE_URL="your-pooled-neon-connection-string"
DIRECT_URL="your-direct-neon-connection-string"
AUTH_SECRET="generate-with: openssl rand -base64 32"
```

Google/GitHub OAuth env vars are optional for local dev — email/password auth (Credentials provider) works without them.

```bash
npx prisma db push
npm run dev
npm test
```

Run `npm test` before opening a PR — the scheduling engine (`src/lib/scheduling.ts`) has full unit test coverage and any change to it must keep tests passing.

## Project structure, briefly

```
src/
├── app/            # Next.js App Router — pages and API routes
├── components/     # React components, grouped by feature
├── lib/
│   ├── scheduling.ts   # The spaced repetition engine — pure functions, fully tested
│   ├── prisma.ts       # Prisma client singleton — import this, never instantiate PrismaClient elsewhere
│   └── platforms/      # One resolver file per coding platform
└── data/            # Local indexed problem datasets (JSON)
```

## Adding a new platform resolver

This is the easiest high-value contribution to make. Every platform (LeetCode, Codeforces, etc.) implements the same interface:

```typescript
// src/lib/platforms/types.ts
export interface PlatformResolver {
  resolve(identifier: string): ResolveResult;
}
```

To add a new platform:

1. Create `src/lib/platforms/your-platform.ts` implementing `PlatformResolver`.
2. If you have a dataset to index, add it under `src/data/` and load it in your resolver.
3. Register it in the central resolver dictionary in `src/lib/platforms/index.ts`.
4. Add the platform to the `Platform` enum in `prisma/schema.prisma` and run a migration.
5. Add a corresponding logo/icon in the platform picker UI.
6. Write tests for the resolver, following the pattern in `src/lib/platforms/leetcode.test.ts`.

That's the whole contract — the scheduling engine, the UI, and the API layer don't need to know anything about your specific platform.

## Code style

- TypeScript everywhere, avoid `any` unless genuinely necessary.
- The scheduling engine (`src/lib/scheduling.ts`) must stay pure — no database calls, no side effects, inputs and outputs only. This is deliberate and load-bearing for testability.
- Match existing formatting/conventions in the file you're editing rather than introducing a new style.
- No large unrelated refactors bundled into a feature PR — keep PRs focused on one thing.

## Pull request process

1. Fork the repo, create a branch off `main` (`feature/your-feature` or `fix/the-bug`).
2. Make your changes, keep commits reasonably scoped and messages clear.
3. Run `npm test` and `npm run dev` to confirm nothing's broken.
4. Open a PR with a clear description: what changed, why, and how you tested it.
5. Be responsive to review feedback — this is a small project maintained by one person, so review turnaround may take a few days.

## Questions

Open an issue, or reach out via the links in the README.

Thanks again for contributing.
