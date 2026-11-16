import "server-only";

/**
 * Tiny in-memory limiter for failed logins (per IP + email). Good enough for a
 * single server; a shared store such as Redis would be needed to scale out.
 */
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < Date.now()) return { allowed: true, retryAfterSec: 0 };
  if (entry.count >= MAX_FAILURES) return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - Date.now()) / 1000) };
  return { allowed: true, retryAfterSec: 0 };
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}
