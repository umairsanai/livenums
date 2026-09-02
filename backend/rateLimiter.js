export class RateLimiter {
  constructor(windowSec, maxRequests) {
    this.windowMs = windowSec * 1000; // e.g., 60000 for 1 minute
    this.maxRequests = maxRequests;   // e.g., 20
    this.clients = new Map();         // key: clientId, value: [timestamp1, timestamp2, ...]
  }

  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, [now]);
      return true;
    }

    // Keep only requests within the current window
    const timestamps = this.clients.get(clientId).filter(t => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      this.clients.set(clientId, timestamps);
      return false; // Rate limit exceeded
    }

    timestamps.push(now);
    this.clients.set(clientId, timestamps);
    return true;
  }
}