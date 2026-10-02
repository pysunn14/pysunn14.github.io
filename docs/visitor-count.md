# Daily visitors

Home, blog pages, and portfolio pages share one `Today` count. The day changes at midnight in Korea (UTC+9). Reloads and visits to other pages count once per browser per day. Browser profiles, other browsers, and devices count separately; clearing the cookie creates a new identity. Counting starts when this feature is deployed.

`VISITOR_DB` binds the D1 database configured in `wrangler.jsonc`. Initialize its schema once with `migrations/0001_visitors.sql`. The normal deployment token needs only the existing Worker deployment permissions; schema administration is separate from code deployment. Local development uses a local database:

```sh
pnpm visitors:init
pnpm dev
```

For a newly provisioned remote database, an account administrator applies the same SQL in the D1 Console or with `wrangler d1 execute VISITOR_DB --remote --file=migrations/0001_visitors.sql` using D1 administration permission. Subsequent code deployments do not rerun schema initialization.

The local initialization command uses Wrangler 4.87.0, matching Astro's Cloudflare Vite plugin and Miniflare runtime. A newer Wrangler can create incompatible local SQLite metadata. Keep this local setup version aligned when updating the Astro adapter; production deployment uses the project's normal Wrangler version.

## Request contract

- `GET /api/visits` reads today's count and establishes a persistent, HTTP-only browser cookie if necessary. It does not count a visit.
- Same-origin `POST /api/visits` records a visit using an existing cookie and returns `{ date, today }`. Without the cookie it returns `400`; cross-origin requests return `403`. Known crawler user agents only read the count.
- Browser Web Locks serialize the GET/POST handshake across tabs, including simultaneous first visits. Modern HTTPS browsers are required for counting. Local development only reads its local database.
- The database stores a daily SHA-256 hash of the random browser ID, without IP addresses or page paths. A primary key rejects duplicates, and an insert trigger updates the daily total atomically. Reading the total does not scan visitor records.
- Failed requests display `Today —` and expose an error state. Server errors return `503` and log a structured failure; they never return a fabricated zero. Focus restoration refreshes the count without adding duplicate visits.

The database remains on the Workers Free plan. Its usage limits are enforced rather than automatically upgrading the plan. Do not enable a paid plan for this feature.

Verify with `pnpm test`, `pnpm exec astro check`, `pnpm build`, and browser checks for concurrent first visits, reloads, page navigation, mobile layout, and an independent browser identity.
