// Simple in-memory rate limiter for local/demo environments
// For production Vercel deployment, replace with Redis (e.g., @upstash/ratelimit)

type RateLimitRecord = { count: number; lastReset: number };
const ipRecords = new Map<string, RateLimitRecord>();

const LIMIT = 10; // Max requests
const WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRecords.get(ip);

  if (!record) {
    ipRecords.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > WINDOW_MS) {
    // Reset window
    ipRecords.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= LIMIT) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true;
}
