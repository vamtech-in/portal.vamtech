interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * In-memory rate limiter
 * @param ip - Client IP or identifier
 * @param action - Action type e.g. "login", "apply", "status"
 * @param maxLimit - Maximum requests allowed in timeframe
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  ip: string,
  action: string,
  maxLimit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const key = `${action}:${ip}`;

  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      success: true,
      remaining: maxLimit - 1,
      resetInMs: windowMs,
    };
  }

  const record = rateLimitStore[key];

  if (record.count >= maxLimit) {
    return {
      success: false,
      remaining: 0,
      resetInMs: record.resetTime - now,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: maxLimit - record.count,
    resetInMs: record.resetTime - now,
  };
}
