<div align="center">

# recall.

**Spaced repetition for Data Structures & Algorithms. Solve once. Remember forever.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Database-Neon%20Postgres-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![License: GPL-3.0](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

**Live:** [recallx.tech](https://recallx.tech) &nbsp;•&nbsp; **Video walkthrough:** [YouTube](https://youtu.be/EF25DZDJ6gw) &nbsp;•&nbsp; **Star this repo** if it's useful — it genuinely helps

</div>

---

## What is this

Solving a DSA problem once doesn't mean you'll remember it weeks later under interview pressure. recall. is an open-source spaced repetition engine for coding practice — add a problem once, and it automatically schedules revision at increasing intervals (3 → 7 → 14 → 30 days), adapting based on how well you actually recall it each time.

It supports LeetCode, Codeforces, GeeksforGeeks, HackerRank, and CodeChef, with instant metadata auto-fill for over **18,000 indexed problems**, a Notion-style editable tracker, daily revision queues, streaks, and a full activity heatmap.

Built and shipped solo, in active daily development, and used daily by its own creator.

![Forgetting Curve & Spaced Repetition Intervals](utils/Forgetting%20Curve.png)

---

## Why it's built the way it is (and why it belongs on Neon + Vercel)

This project leans deliberately on both platforms rather than treating them as interchangeable infrastructure:

- **Neon** — chosen specifically for its serverless Postgres model. recall. uses Neon's dual connection strings (pooled via PgBouncer for all runtime serverless queries, direct for migrations) to handle concurrent request load from Vercel's serverless functions without exhausting connection limits — a real, deliberate architectural decision documented in [Architecture Notes](#architecture-notes) below, not an afterthought.
- **Vercel** — the entire app is deployed on Vercel's platform, using the App Router's Server Components and Route Handlers as first-class citizens rather than a bolted-on API layer. The project is a genuine, idiomatic Next.js 16 app, not a legacy app force-fit onto the platform.

Both integrations are core to how the product works, not just where it happens to be hosted.

---

## How the core engine works

recall.'s scheduling logic lives in [`src/lib/scheduling.ts`](src/lib/scheduling.ts) as a deterministic, pure, fully unit-tested function set — zero database dependency inside the logic itself, verified independently with Vitest before anything was built on top of it.

### The Revision Ladder
Every tracked problem climbs a 4-step interval ladder (`LADDER_DAYS = [3, 7, 14, 30]`):
- **Step 0:** Review in **3 days** (initial schedule for all new problems)
- **Step 1:** Review in **7 days**
- **Step 2:** Review in **14 days**
- **Step 3:** Review in **30 days**

### Confidence Ratings & State Transitions

**Regular review (active problems):**
- **`CLEAN`** — advances to the next step (Step 0-2), or transitions to **`MASTERED`** if already at Step 3, exiting the active queue.
- **`SHAKY`** — repeats the current interval (doesn't advance, doesn't reset).
- **`STRUGGLED`** — resets completely to Step 0, regardless of prior progress.

**Recheck review (mastered problems pulled back into rotation):**
- **`CLEAN`** — fast-forwards directly to Step 3.
- **`SHAKY`** — placed at Step 1.
- **`STRUGGLED`** — full reset to Step 0.

### Lifecycle
- **Overdue problems never expire or drop off** — they persist in the daily queue until revised, and rescheduling is calculated from the actual revision date, not the original due date.
- **Streaks** count backward from today (or yesterday, if today's revision hasn't happened yet), resetting only if both days are empty.

![The Revision Ladder](utils/Revision%20ladder.png)

Full breakdown of every transition, trigger, and edge case is documented inline in [`src/lib/scheduling.ts`](src/lib/scheduling.ts) and its accompanying [test suite](src/lib/scheduling.test.ts).

---

## Features

- **Multi-platform, pluggable resolver architecture** — `LEETCODE`, `CODEFORCES`, `GFG`, `HACKERRANK`, `CODECHEF`, each implementing a shared `PlatformResolver` interface so a new platform is one new file, not a rewrite.
  - LeetCode: in-memory O(1) lookup across 2,800 problems, with a **live GraphQL fallback** to LeetCode's public API for problems not yet in the local dataset.
  - Codeforces: 11,335 problems indexed, lookup by code (`4A`) or numeric ID.
  - CodeChef: 4,825 problems indexed, lookup by code, ID, title, or URL.
  - GFG / HackerRank: seed datasets with URL-slug parsing fallback.
- **Notion-style inline table** — click-to-create rows, click-to-edit cells, no modals, autosave.
- **Schema-less custom columns** — users define their own columns without a database migration; values live in a `Json` field, updated atomically.
- **Auth** — NextAuth.js v5 with Google, GitHub, and Credentials providers, automatic cross-provider account linking.
- **Daily revision queue + streaks + 365-day activity heatmap.**
- **Full data export** — one-click JSON backup of every problem, revision, and streak record. No lock-in.

---

## Tech Stack

**Framework:** Next.js 16 (App Router, React 19) · **Language:** TypeScript 5 · **Database:** Neon Serverless PostgreSQL · **ORM:** Prisma 6 · **Auth:** NextAuth.js v5 + `@auth/prisma-adapter` · **Styling:** Tailwind CSS 4 · **Animation:** Motion, Lenis · **Data fetching:** SWR · **Testing:** Vitest · **Hosting:** Vercel

---

## Building with Neon — what this project teaches

This section exists specifically to help other developers avoid a mistake that's easy to make and hard to diagnose: using Neon incorrectly in a serverless Next.js app.

### The problem this solves

Vercel's serverless functions can spin up many concurrent invocations under real traffic. Each invocation that opens its own direct Postgres connection adds up fast — Neon's free tier (and even paid tiers, past a point) have a hard connection ceiling. If every API route opens a fresh direct connection, a modest traffic spike can exhaust it, and you start seeing intermittent `"too many connections"` errors that are maddening to debug because they only appear under load, never in local dev.

### The fix — two connection strings, two jobs

Neon gives you both a **pooled** endpoint (routed through PgBouncer) and a **direct** endpoint. They are not interchangeable, and using the wrong one for the wrong job is the root cause of most Neon + serverless connection issues:

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled — every runtime query goes through this
  directUrl = env("DIRECT_URL")     // direct — migrations ONLY
}
```

- **`DATABASE_URL`** — Neon's pooled connection string (hostname contains `-pooler`). PgBouncer multiplexes many short-lived serverless connections onto a small number of real Postgres connections underneath. **Every API route, every Server Component query, everything that runs at request-time uses this one.**
- **`DIRECT_URL`** — Neon's non-pooled connection string. PgBouncer's transaction pooling mode doesn't support some DDL operations Prisma migrations need, so migrations bypass the pooler entirely and talk to Postgres directly. **This connection is only ever used by `prisma migrate` / `prisma db push` — never at runtime.**

Get both strings from your Neon dashboard's Connection Details panel — it explicitly labels which one is pooled.

### The second half of the fix — a real singleton

Even with the right connection string, creating a new `PrismaClient` instance on every request defeats the purpose — you're back to one connection per invocation. In Next.js specifically, hot reloads in development also spawn new clients unless you guard against it:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Import `prisma` from this one file everywhere in the app. Never call `new PrismaClient()` anywhere else.

### How we verified this was actually working

Rather than assume the setup was correct, we ran a concurrent-load diagnostic before shipping: 50 simultaneous requests against a live API route, checking for connection timeouts or pool exhaustion errors. Zero failures, confirming the pooled connection was correctly absorbing concurrent serverless load rather than each invocation fighting over the direct connection limit. If you're setting this up yourself, don't just trust that it's configured right — this exact test (fire N concurrent requests with `Promise.all()`, watch for connection errors) is the fastest way to confirm it before you find out the hard way in production.

### The mistake we actually made, so you don't have to

Early in this project, the Prisma dependency was installed without pinning a version, and an unrelated network error caused an automated build step to silently drift onto Prisma 7, which uses a different configuration pattern (`prisma.config.ts` instead of the `schema.prisma`-only datasource block shown above). This broke the dual-connection setup in a confusing way — the symptoms looked like a Neon problem but were actually a Prisma version mismatch. Lesson: **pin your Prisma version explicitly**, and if a dependency install fails partway through, don't assume whatever version ends up installed is the one you intended.

---

## Other Architecture Notes

- **Pluggable Platform Resolver Pattern** — every platform lookup implements `PlatformResolver { resolve(identifier: string): ResolveResult }`, registered in a central dictionary. Adding platform #6 requires one new file, zero changes to the schema, UI, or API layer.
- **Schema-less Custom Fields** — user-defined columns are stored in a `Json` field (`Problem.customFields`) rather than triggering a migration per new column, paired with `UserColumnConfig` for layout/ordering.

---

## Database Schema

| Model | Purpose |
|---|---|
| `User` | Accounts, hashed credentials, NextAuth session/OAuth relations |
| `Problem` | Platform, ladder step (0-3), status (`ACTIVE`/`MASTERED`/`RETIRED`), `nextRevisionAt`, `customFields` JSON |
| `Revision` | Full history — confidence rating, review type, step transitions |
| `StreakLog` | Daily completion tracking |
| `UserColumnConfig` | Per-user custom column schema |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET`, `POST` | `/api/problems` | List with filtering/sorting, or create with auto-metadata resolution |
| `GET` | `/api/problems/due` | Problems currently due or overdue |
| `GET`, `PATCH`, `DELETE` | `/api/problems/[id]` | Fetch, update, or delete a problem |
| `PATCH` | `/api/problems/[id]/revise` | Submit a confidence rating, advance the ladder |
| `PATCH` | `/api/problems/[id]/revise-again` | Pull a mastered problem back as a recheck |
| `PATCH` | `/api/problems/[id]/retire` | Manually retire a problem |
| `PATCH` | `/api/problems/[id]/custom-fields` | Atomic custom column value update |
| `GET`, `POST`, `DELETE` | `/api/columns` | Manage custom column definitions |
| `GET` | `/api/activity` | 365-day revision activity for the heatmap |
| `GET` | `/api/streak` | Current streak + today's completion status |
| `GET` | `/api/export` | Full JSON data export |

---

## Project Structure

```text
recall/
├── prisma/schema.prisma        # Schema + dual-connection Neon config
├── src/
│   ├── app/
│   │   ├── (app)/               # Authenticated views: dashboard, daily, settings
│   │   ├── (landing)/            # Public marketing site
│   │   ├── api/                  # Route handlers
│   │   └── auth/                 # Login/register
│   ├── components/
│   │   ├── problems-table/       # Interactive table + cell editors
│   │   ├── daily/                 # Revision queue + streak UI
│   │   └── heatmap/               # Activity heatmap
│   ├── data/                      # Indexed offline problem datasets
│   └── lib/
│       ├── scheduling.ts          # The spaced repetition engine
│       ├── prisma.ts              # Prisma client singleton
│       └── platforms/             # Pluggable platform resolvers
```

---

## Getting Started

```bash
git clone https://github.com/Vinit1936/Recall.git
cd Recall
npm install
```

`.env`:
```env
DATABASE_URL="postgresql://user:password@endpoint-pooler.region.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@endpoint.region.neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-auth-secret-key"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

```bash
npx prisma db push
npm run dev
```

Open [localhost:3000](http://localhost:3000). Run tests with `npm test`.

---

## Contributing

This is an actively maintained, solo-built project that's genuinely open to contributions — not just open source in name. Bug reports, feature suggestions, and PRs are welcome. Open an issue before a large PR so the direction can be agreed on first.

---

## Roadmap

- [ ] CSV / Anki import
- [ ] Multiple named problem lists (e.g. Blind 75, NeetCode 150 as separate tracked sets)
- [ ] Live-lookup fallback for Codeforces / CodeChef / GFG
- [ ] Revision reminder notifications

---

## Author

**Vinit Patil** — [GitHub](https://github.com/Vinit1936) · [Twitter/X](https://twitter.com/vinitpatil193) · [LinkedIn](https://www.linkedin.com/in/vinitpatil19/)

## License

GPL-3.0 — see [LICENSE](LICENSE).

<div align="center">
<sub>Built solo. Used daily by its own creator. Master algorithms through structured spaced repetition.</sub>
</div>
