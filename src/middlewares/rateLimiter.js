const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(process.env.MAX_DAILY_UPLOADS) || 100,
  message: 'Too many requests from this IP, please try again later.',
});

module.exports = limiter;
