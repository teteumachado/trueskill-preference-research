# TrueSkill Preference Research

A ranking and preference discovery system powered by the TrueSkill algorithm. Collect preferences through pairwise comparisons and get a statistically sound ranking with confidence levels — no abstract scales, no bar charts from thin air.

## The Problem

Most preference research relies on methods that weren't designed for the job:

- **A/B testing** is precise but slow and expensive for comparing more than 2 options
- **Likert scales** produce noisy data — people calibrate scales differently
- **Multi-armed bandits** optimize for conversion, not understanding

## The Approach

TrueSkill is a Bayesian ranking algorithm originally created by Microsoft Research for Xbox Live matchmaking. Instead of asking people to rate items on an abstract scale, it learns from **direct pairwise comparisons** — "Do you prefer A or B?" — and reconstructs a global ranking from those relative judgments.

Each item has two parameters:

| Parameter | Meaning |
|-----------|---------|
| **μ (mu)** | Estimated quality — position in the ranking |
| **σ (sigma)** | Uncertainty of that estimate — how much we don't know yet |

A low σ means the system is confident about an item's position; a high σ means it needs more comparisons. This lets the system **intelligently select which pairs to show next** — prioritizing comparisons where uncertainty is highest or ratings are closest.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | **Elysia.js** (port 8000, Node.js) |
| Web | **Next.js 16** (port 3000, Turbopack) |
| ORM | **Drizzle ORM + SQLite** (`@libsql/client`) |
| Auth | **Better Auth** (email/password) |
| UI | **shadcn/ui** (Radix + Tailwind v4) |
| Icons | **Lucide React** |
| Forms | `@tanstack/react-form` |
| Charts | **Recharts** (via shadcn chart) |
| Monorepo | **Turborepo** + pnpm workspaces |

## Architecture

```
apps/
├── api/          Elysia.js server — REST API for projects, items, comparisons
└── web/          Next.js app — dashboard, compare page, ranking view

packages/
├── database/     Drizzle schema + DB client (SQLite)
├── trueskill/    TrueSkill engine (rating update + pair selection)
└── ui/           Shared shadcn/ui components
```

### Data flow

```
User votes (A vs B)
        ↓
TrueSkill Engine  →  updates μ and σ for both items
        ↓
Pair selection engine  →  picks the most informative next pair
        ↓
Ranking with confidence per item
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp apps/api/.env.example apps/api/.env

# Start development servers
pnpm dev
```

This starts both the API (`localhost:8000`) and the web app (`localhost:3000`) concurrently.

## Project Structure

### API Routes (`/projects`)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/projects` | List user's projects |
| `POST` | `/projects` | Create a project |
| `GET` | `/projects/:id` | Get project details |
| `GET` | `/projects/:id/items` | List items in a project |
| `GET` | `/projects/:id/items/ranking` | Ranked items by TrueSkill rating |
| `POST` | `/projects/:id/items` | Add an item |
| `PUT` | `/projects/:id/items/:itemId` | Update an item |
| `DELETE` | `/projects/:id/items/:itemId` | Delete an item |
| `GET` | `/projects/:id/next-pair` | Get the next pair to compare |
| `POST` | `/projects/:id/comparisons` | Register a vote |
| `GET` | `/projects/:id/stats` | Aggregated stats with time filter |

### Web Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Dashboard home |
| `/dashboard/projects` | Project list |
| `/dashboard/projects/:id` | Project detail with stats, ranking, and items |
| `/compare/:id` | Vote on item pairs |

## Database

The SQLite database (`local.db`) stores:

- **users** and **sessions** (managed by Better Auth)
- **projects** with owner relationships
- **items** with TrueSkill μ and σ values
- **comparisons** recording each pairwise vote

## The TrueSkill Engine (`packages/trueskill`)

- **`update(winner, loser)`** — Bayesian update of μ and σ based on a comparison outcome
- **`nextPair(items)`** — Selects the pair with highest combined uncertainty: `σ_a + σ_b − α|μ_a − μ_b|`

## What This Is (and Isn't)

TrueSkill doesn't answer "what is the best in absolute terms?" It answers "based on the comparisons so far, which item is most likely to be preferred?"

It lives in the **exploration and discovery** phase — before you have enough data for a definitive A/B test. The ideal workflow:

```
TrueSkill  →  preference ranking with few data points
     ↓
Top 2-3 candidates selected
     ↓
A/B Testing  →  validation with real business metrics
```
