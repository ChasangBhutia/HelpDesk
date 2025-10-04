module.exports.allowRoles = (...allowed) => (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
        return res.status(403).json({ error: { code: "FORBIDDEN", message: "Access denied" } });
    }
    next();
};