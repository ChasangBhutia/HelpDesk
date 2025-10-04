const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports.isLoggedIn = async (req, res, next) => {
    try {
        // token stored in cookie named 'token'
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(payload.id);
        if (!user) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid token" } });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
    }
};
