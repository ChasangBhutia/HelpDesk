// rateLimitMiddleware.js
const rateLimitMap = new Map(); // key: userId, value: { count, timestamp }

const RATE_LIMIT = 60; // requests
const WINDOW_MS = 60 * 1000; // 1 minute

module.exports.rateLimit = (req, res, next) => {
    try {
        const userId = req.user?._id?.toString(); // authenticated user
        if (!userId) return next(); // skip for unauthenticated requests

        const now = Date.now();
        const userData = rateLimitMap.get(userId) || { count: 0, timestamp: now };

        // reset count if window expired
        if (now - userData.timestamp > WINDOW_MS) {
            userData.count = 1;
            userData.timestamp = now;
            rateLimitMap.set(userId, userData);
            return next();
        }

        // check limit
        if (userData.count >= RATE_LIMIT) {
            return res.status(429).json({
                error: { code: "RATE_LIMIT", message: "Too many requests. Try again later." }
            });
        }

        // increment count
        userData.count += 1;
        rateLimitMap.set(userId, userData);
        next();
    } catch (err) {
        console.error("rateLimitMiddleware error:", err);
        next(); // fail open in case of error
    }
};
