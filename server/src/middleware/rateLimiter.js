const ipMap = new Map();

/**
 * Lightweight zero-dependency in-memory rate limiter middleware.
 * Prevents API request abuse by tracking IP hit counts.
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60000; // 1 minute window
  const max = options.max || 60; // default limit per minute
  const message = options.message || { success: false, message: "Too many requests. Please wait a moment and try again." };

  return (req, res, next) => {
    // Determine client IP address
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global_ip";
    const now = Date.now();

    if (!ipMap.has(ip)) {
      ipMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const rateData = ipMap.get(ip);

    // If request timestamp is past the reset window, clear the hits counter
    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + windowMs;
      return next();
    }

    rateData.count++;
    if (rateData.count > max) {
      console.warn(`[RATE LIMIT EXCEEDED] IP: ${ip} reached limit on route: ${req.originalUrl}`);
      return res.status(429).json(message);
    }

    next();
  };
};

module.exports = rateLimiter;
