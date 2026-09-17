# Michigan Street Poutine Week

Voting site for Michigan Street Poutine Week, Grand Rapids.
Live at **https://poutine.mistreet.org**

Next.js 15 (App Router) + Supabase. Two pages, both client components.

---

## Getting set up

```bash
git clone git@github.com:ziurai/poutine-vote.git
cd poutine-vote
npm install
cp .env.example .env.local   # then fill it in - see below
npm run dev                  # http://localhost:3000
```

### Environment variables

`.env.local` is gitignored and you have to create it. See `.env.example` for
the full list.

**`vercel env pull` does not work for this project.** The `development`
environment has no variables at all, and pulling `production` returns every
encrypted value as an empty string. Worse, it writes `.env.production.local`,
which then overrides your real `.env.local` during `npm run build`. Copy the
values out of the Vercel dashboard by hand, or ask Alex for them.

Ask Alex for the two `NEXT_PUBLIC_SUPABASE_*` values. Those are the
only ones needed to run the site. The three `MAILCHIMP_*` vars only affect
`/api/subscribe`; without them that one route returns 500 and nothing else
notices.

---

## Where things are

| Path | What it is |
|---|---|
| `app/page.jsx` | The entire public site - email gate, how-it-works, the passport/voting UI, the Gravy Train modal. All CSS is a template string at the top of the file. |
| `app/admin/page.jsx` | `/admin` - leaderboard, restaurant editor, participant list. Same CSS-in-a-string pattern. |
| `app/api/subscribe/route.js` | Posts new signups to Mailchimp. Fire-and-forget; failures are swallowed on the client. |
| `app/layout.jsx` | Page title and favicon. **Do not add a `layout.tsx`** - Next resolves `.tsx` before `.jsx`, so it would silently shadow this file. |
| `public/` | Images (WebP) and the GravySans fonts. |

There is no component library. Tailwind is installed and `app/globals.css`
imports it, but neither page uses a single utility class - all styling is in
those template strings. Don't assume Tailwind works here without checking.

### Restaurants are data, not code

The restaurant list, votes, and stamps live in Supabase, not in the repo:

- `restaurants` - name, description, `sort_order`, `active`
- `participants` - email, `visited` (array of restaurant ids), `favorite`

Edit restaurants at `/admin` → Restaurants. Changing the lineup needs no deploy.
`/admin` is gated by Supabase Auth (email + password), so you need a user
created in the Supabase project before you can get in.

---

## Deploying

**Pushing to `main` publishes to the live public site within about 30 seconds.**
There is no staging step and no review gate. During the event (Sept 16-27) the
site is in active use, so check your work locally first.

```bash
npm run dev     # verify the change
git push origin main
```

### The two-Vercel-project trap

This repo is connected to **two** Vercel projects, and a push builds both:

| Project | Serves | Notes |
|---|---|---|
| `poutine-vote` | **poutine.mistreet.org** - the real site | Has all five env vars |
| `poutine-vote-bial` | redundant duplicate | Missing the Mailchimp vars, so `/api/subscribe` 500s there |

**Verify your changes on https://poutine.mistreet.org, not on a `*.vercel.app`
URL.** For 105 days the domain was served by a project that had stopped
building, so pushes appeared to do nothing. `next.config.ts` now 308-redirects
the `*.vercel.app` hosts to the real domain.

Raw Vercel deployment URLs are behind Vercel SSO, so you need a seat on the
Vercel team to open a preview build.

---

## Known rough edges

- `npm run lint` fails: `eslint.config.mjs` imports `eslint-config-next/core-web-vitals`
  without the `.js` extension. `npm run build` still succeeds.
- `package.json` pins `engines.node` to `22.x`, but Vercel builds on 24.x.
- The Supabase anon key is in this repo's git history from before it moved to
  env vars. It's a public-by-design key (it ships in the browser bundle either
  way), so row-level security is what actually protects the data.
