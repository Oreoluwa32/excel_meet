/**
 * Client-side rate limiting utility
 * Prevents excessive API calls and protects against abuse
 */

class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    // Remove old requests outside the time window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        retryAfter: this.windowMs - (now - validRequests[0])
      };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll() {
    this.requests.clear();
  }

  /**
   * Get current request count for a key
   */
  getCount(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    return userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    ).length;
  }
}

// Create default rate limiters for different operations
export const apiRateLimiter = new RateLimiter(60, 60000); // 60 requests per minute
export const authRateLimiter = new RateLimiter(5, 300000); // 5 requests per 5 minutes
export const searchRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute
export const uploadRateLimiter = new RateLimiter(10, 60000); // 10 uploads per minute

/**
 * Decorator function to add rate limiting to async functions
 */
export const withRateLimit = (fn, rateLimiter, keyFn = () => 'default') => {
  return async (...args) => {
    const key = keyFn(...args);
    const { allowed, retryAfter, remaining } = rateLimiter.isAllowed(key);

    if (!allowed) {
      const error = new Error('Rate limit exceeded');
      error.retryAfter = retryAfter;
      error.code = 'RATE_LIMIT_EXCEEDED';
      throw error;
    }

    try {
      const result = await fn(...args);
      return { result, remaining };
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Token bucket algorithm for more flexible rate limiting
 */
export class TokenBucket {
  constructor(capacity = 10, refillRate = 1, refillInterval = 1000) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.refillInterval = refillInterval;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on time elapsed
   */
  refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillInterval) * this.refillRate;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Try to consume tokens
   */
  consume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return {
        allowed: true,
        remaining: this.tokens
      };
    }

    return {
      allowed: false,
      remaining: this.tokens,
      retryAfter: Math.ceil((tokens - this.tokens) / this.refillRate) * this.refillInterval
    };
  }

  /**
   * Reset bucket to full capacity
   */
  reset() {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}

export default RateLimiter;