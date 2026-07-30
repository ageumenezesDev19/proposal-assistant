# Pitchfolio

**Paste a job post, get a proposal drafted from your own case studies, and track which ones get replies.**

Freelance proposals are a volume game with a quality floor: generic ones don't convert, and
personalised ones cost 20+ minutes each. Pitchfolio reads the post, pulls out what the client
actually needs, and drafts a reply grounded in the work you've already done — then keeps score of
what came back.

Built because I needed it to break into the international market, which is also why it gets used
daily rather than sitting in a portfolio.

---

## What it does

1. **Reads the job post.** Extracts requirements, budget, timeline, and flags what's ambiguous —
   "custom reports" can mean a table or a full BI layer, and the difference is four weeks.
2. **Drafts the proposal.** Picks the closest case study from your saved work and writes a reply
   that cites a concrete result, not adjectives.
3. **Lets you rewrite it.** Every line is editable in place. The draft is a starting point.
4. **Tracks the funnel.** Mark proposals sent → replied → won, and watch your reply rate move.

## Engineering decisions worth explaining

### AI that doesn't break when the free tier runs out

Free LLM tiers are rate limited, so depending on one is a design flaw. The app declares an ordered
list of providers and walks it until one answers:

```
Groq (Llama 3.3 70B) → Gemini 2.0 Flash → seeded demo content
```

Groq goes first for two reasons: it streams at ~750 tokens/s, which is what makes the draft feel
instant, and it **does not train on what it's sent** — users paste job posts and their own profile.
Gemini's free tier does train on prompts, so it's the fallback, not the default.

Failover is selective: a 429 or 5xx moves to the next provider, but a rejected prompt or a bad key
doesn't — retrying those just burns the next provider's quota too. Callers never learn which one
answered; they get tokens and, at the end, a name for the audit line.

→ [`src/lib/ai/providers.ts`](src/lib/ai/providers.ts)

### Structured output, validated

The model returns JSON, not prose, so the UI can build requirement chips and flag cards instead of
dumping a paragraph. Zod validates the shape before it reaches a component.

This caught a real bug in testing: Groq writes `"flag": null` for an omitted optional field rather
than leaving the key out, and a bare `.optional()` rejects `null`. The schema now folds null back to
undefined so the inferred type still matches the demo data exactly.

→ [`src/lib/ai/schema.ts`](src/lib/ai/schema.ts)

### Row-level security, not trust

The Supabase anon key is public by design — it ships to the browser. What keeps one user's
proposals away from another is RLS: every table is gated on `auth.uid()` matching the row's owner.

The admin flag needed one more layer. RLS checks *which row* you're writing, not *which column*, so
a user could have PATCHed their own profile row to set `is_admin = true` through the anon key and
skipped the rate limit. A `BEFORE UPDATE` trigger reverts any change to that column unless the write
comes from `service_role` — meaning the SQL editor, never the browser.

→ [`supabase/schema.sql`](supabase/schema.sql)

### Rate limiting a shared resource

Groq's free tier is 1,000 requests/day for the whole app, not per user. Without a limit, one runaway
client exhausts everyone's quota. Requests are capped at 5 analyses/hour/user (Upstash Redis), the
job post is capped at 6,000 characters, and the endpoint requires a session — which ties every
request to an accountable `user_id` and puts Supabase's own signup limits in front of it.

→ [`src/lib/rate-limit.ts`](src/lib/rate-limit.ts)

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) · React 19 · TypeScript |
| Styling | Tailwind v4 (CSS-first `@theme` tokens) |
| Data | Supabase — Postgres, Auth (magic link), RLS |
| AI | Groq (Llama 3.3 70B) → Gemini 2.0 Flash |
| Rate limiting | Upstash Redis |
| Hosting | Vercel |

Total infrastructure cost: **$0** — every service runs on its free tier.

## Measured

Lighthouse, production build, `/` and `/new`:

| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 93 | 100 | 100 | 100 |

## Design

The product is a tool someone opens every working day, so it's built to be read for hours rather
than to photograph well: warm paper tones, a serif for documents, a sans for the interface, and a
mono for figures. The signature element is the **manuscript** — the draft is set as a document with
the analysis in the margin beside it, like an editor's marginalia, rather than as a form next to a
results panel.

→ [`docs/DESIGN.md`](docs/DESIGN.md) · [`docs/SPEC.md`](docs/SPEC.md)

## Running it

```bash
npm install
cp .env.local.example .env.local   # fill in your own keys
node scripts/check-secrets.mjs     # verifies each service responds, prints no secrets
npm run dev
```

Then run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase project's SQL editor.

Without keys the app still runs: every screen falls back to seeded demo content, so the whole flow
is walkable without an account — which is also how a visitor tries it without spending the AI quota.
