import LRU from "lru-cache";
import type { NextRequest } from "next/server";

const limiter = new LRU<string, { hits: number; firstHit: number }>({
  max: 5000,
});

interface RateLimitOptions {
  intervalMs?: number;
  allowedHits?: number;
}

/**
 * In-memory rate limit helper for serverless functions.
 * Good enough for demo purposes; swap with Redis/Upstash in production.
 */
export const enforceRateLimit = (
  req: NextRequest,
  { intervalMs = 60_000, allowedHits = 5 }: RateLimitOptions = {}
) => {
  const identifier =
    req.headers.get("x-client-id") ?? req.ip ?? "anonymous-client";

  const now = Date.now();
  const entry = limiter.get(identifier);

  if (!entry) {
    limiter.set(identifier, { hits: 1, firstHit: now }, { ttl: intervalMs });
    return { allowed: true };
  }

  if (now - entry.firstHit <= intervalMs && entry.hits >= allowedHits) {
    return { allowed: false };
  }

  const hits = entry.hits + 1;
  limiter.set(identifier, { hits, firstHit: entry.firstHit }, { ttl: intervalMs });
  return { allowed: true };
};
