const rateLimit = require('express-rate-limit');

const FILE_UPLOAD_LIMIT = process.env.UPLOAD_LIMIT || 1; // Max uploads per windowMs per IP
const FILE_DOWNLOAD_LIMIT = process.env.DOWNLOAD_LIMIT || 2; // Max downloads per windowMs per IP

const downloadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours/ daily usage limiter for download 
  max: FILE_DOWNLOAD_LIMIT,
  message: "Too many download requests from this IP, please try again later.",
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send("Too many requests");
  }
});

const uploadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours/ daily usage limiter for upload
  max: FILE_UPLOAD_LIMIT,
  message: "Too many upload requests from this IP, please try again later.",
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send("Too many requests");
  }
});

module.exports = { downloadLimiter, uploadLimiter };
