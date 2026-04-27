/**
 * In-memory token-bucket rate limiter.
 *
 * NOTE: This is per-process. For multi-instance deployments, replace the
 * `store` Map with Redis (Upstash, Vercel KV, etc.) using INCR + EXPIRE.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Cleanup stale buckets every 5 min to prevent memory bloat
let cleanupTimer: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      if (bucket.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

export interface RateLimitOptions {
  /** Max requests in the window */
  max: number;
  /** Window length in ms */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  ensureCleanup();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + opts.windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: opts.max - 1, resetAt, retryAfterSeconds: 0 };
  }

  if (existing.count >= opts.max) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: opts.max - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

/** Best-effort client IP extraction (trusts X-Forwarded-For from infra). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

/** Convenience helper for API routes. Returns Response on limit, null when OK. */
export function rateLimitResponse(
  key: string,
  opts: RateLimitOptions
): Response | null {
  const r = rateLimit(key, opts);
  if (r.success) return null;
  return new Response(
    JSON.stringify({ success: false, error: "Too many requests" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(r.retryAfterSeconds),
        "X-RateLimit-Reset": String(Math.floor(r.resetAt / 1000)),
      },
    }
  );
}
