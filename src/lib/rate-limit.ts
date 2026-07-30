import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Guards the AI endpoint, which is the one route that spends a shared, finite
 * resource: Groq's free tier is 1,000 requests/day for the whole app, not per
 * user. Without a limit here, one runaway client (or a script kiddie who finds
 * the endpoint) exhausts everyone else's quota for the day.
 *
 * Upstash's free tier (10k commands/day, no card) keeps this at R$0, matching
 * the rest of the stack. If the env vars are absent — local dev without an
 * Upstash project — the limiter no-ops rather than blocking, since the auth
 * check in front of it is already the primary gate against anonymous abuse.
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// 5 analyses per hour per user. Generous for a real job search, tight enough
// that one account can't eat the daily Groq budget alone.
const analyzeLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "pitchfolio:analyze",
    })
  : null;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkAnalyzeLimit(userId: string): Promise<RateLimitResult> {
  if (!analyzeLimiter) {
    return { allowed: true, remaining: Infinity, resetAt: new Date(0) };
  }

  const { success, remaining, reset } = await analyzeLimiter.limit(userId);
  return { allowed: success, remaining, resetAt: new Date(reset) };
}
