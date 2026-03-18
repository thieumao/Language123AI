# Language123 (AI English Learning MVP)

Next.js (App Router) + TypeScript + Tailwind + Prisma + Postgres.

## What's included

- Admin pages:
  - `/admin/editor`: paste an article, generate sections (mock AI), edit, then Save Draft / Publish.
  - `/admin/articles`: list articles and jump to the editor.
- User pages:
  - `/learn`: list published articles
  - `/learn/[id]`: reading, vocabulary, interactive question, and discussion prompts
- API (thin wrappers over services):
  - `POST /api/generate`
  - `POST /api/improve` (also used for "Regenerate")
  - `POST /api/detect-level`
  - `POST /api/articles`
  - `GET /api/articles`
  - `GET /api/articles/[id]`
  - `PUT /api/articles/[id]`

AI responses are mocked in `lib/ai.ts` for MVP.

## Prerequisites

- Node.js
- PostgreSQL (Supabase recommended in your spec)

## Setup

1. Configure database URL
   - Edit `.env` (or create your own) with `DATABASE_URL`.
   - Copy from `.env.example`.

2. Create the DB table

```bash
yarn prisma:db:push
```

3. Generate Prisma client

```bash
yarn prisma:generate
```

## Run the dev server

```bash
yarn dev
```

Then open:

- Admin: `http://localhost:3000/admin/editor`
- User: `http://localhost:3000/learn`

