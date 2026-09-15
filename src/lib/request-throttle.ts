type Attempt = { count: number; resetAt: number };

const globalStore = globalThis as typeof globalThis & {
  __echonflowAuthAttempts?: Map<string, Attempt>;
};

const attempts = globalStore.__echonflowAuthAttempts ?? new Map<string, Attempt>();
globalStore.__echonflowAuthAttempts = attempts;

/** A small first line of defence for public auth-email endpoints. */
export function allowRequest(key: string, limit = 4, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}
