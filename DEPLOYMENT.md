# CineVerse — Deployment & Configuration

## Build & Verify

- **TypeScript:** `npx tsc --noEmit` (must pass with zero errors)
- **Build:** `npm run build` (completes without requiring MongoDB at build time)
- **Lint:** `npm run lint`

## Environment Variables

Set these in your host (Vercel, Render, etc.):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_TMDB_API_KEY` | Yes | TMDB API key for series data |
| `MONGODB_URI` | Yes (for watchlist/APIs) | MongoDB Atlas connection string recommended |
| `GROQ_API_KEY` | No | Enables AI CoPilot & AI recommendations; optional |
| `NEXT_PUBLIC_APP_URL` | No | Optional; defaults work for most hosts |

## Hosting

- **Vercel:** Connect repo, add env vars, deploy. No extra config.
- **Render:** Use "Web Service", build command `npm run build`, start `npm start`. Add env vars in dashboard.
- **Node hosts:** Run `npm run build` then `npm start`. Ensure `MONGODB_URI` and `NEXT_PUBLIC_TMDB_API_KEY` are set.

## Notes

- MongoDB is **lazy-connected** (only when an API route is called), so build does not require a live database.
- All API routes use `dynamic = 'force-dynamic'` so they are not statically analyzed at build time.
- Next.js image optimization uses `remotePatterns` for `image.tmdb.org` (no deprecated `domains`).
