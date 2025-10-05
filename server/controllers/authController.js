const bcrypt = require('bcrypt');
const isStrongPassword = require('../utils/isStrongPassword');
const userModel = require("../models/userModel");
const idempotencyKeyModel = require('../models/idempotencyKeyModel');
const generateToken = require('../utils/generateToken');
const jwt = require("jsonwebtoken");


module.exports.getMe = async (req, res) => {
    try {
        // 1. Get token from cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                error: {
                    code: "UNAUTHORIZED",
                    field:"jwtToken",
                    message: "No token found. Please log in.",
                },
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Fetch user from DB
        const user = await userModel.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({
                error: {
                    code: "USER_NOT_FOUND",
                    field:"userId",
                    message: "User not found.",
                },
            });
        }

        // 4. Return user data
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    status: user.status,
                    role: user.role,
                    specialties: user.specialties,
                    createdAt: user.createdAt,
                },
            },
        });
    } catch (err) {
        console.error("Error in /auth/me:", err.message);
        return res.status(401).json({
            error: {
                code: "INVALID_TOKEN",
                error:"token",
                message: "Invalid or expired token. Please log in again.",
            },
        });
    }
};


module.exports.registerUser = async (req, res) => {
    const { fullname, email, password, role, specialties } = req.body;

    const idempotencyKey = req.headers['idempotency-key'];

    //Idempotency check
    if (idempotencyKey) {
        const existing = await idempotencyKeyModel.findOne({ key: idempotencyKey });
        if (existing) return res.status(200).json(existing.response);
    }

    const missingFields = [];

    if (!fullname) missingFields.push("fullname");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!role) missingFields.push("role");

    if (missingFields.length > 0) return res.status(400).json({
        error: {
            code: "FIELDS_REQUIRED",
            fields: missingFields,
            message: `The following fields are required: ${missingFields.join(', ')}`
        }
    });
    const allowedRoles = ['user', 'agent', 'admin'];
    if (!allowedRoles.includes(role)) return res.status(400).json({
        error: {
            code: "INVALID_ROLE",
            field: "role",
            message: `Role must be one of: ${allowedRoles.join(', ')}`
        }
    })
    if (!isStrongPassword(password)) return res.status(400).json({
        error: {
            code: "WEAK_PASSWORD",
            field: "password",
            message: "Password must be at least 8 characters, includes uppercase, lowercase, number, and special character"
        }
    })
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(409).json({
            error: {
                code: "USER_ALREADY_EXISTS",
                field: "email",
                message: "A user with this email already exists"
            }
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const userData = { fullname, email, password: hash, role };
        if (role === 'agent') {
            if (specialties?.length > 0) userData.specialties = specialties;
        }
        const newUser = await userModel.create(userData);
        const token = generateToken(newUser._id, newUser.email, newUser.role);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        const response = {
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    _id: newUser._id,
                    fullname: newUser.fullname,
                    email: newUser.email,
                    status: newUser.status,
                    role: newUser.role,
                    specialties: newUser.specialties,
                    createdAt: newUser.createdAt
                }
            }
        }

        if (idempotencyKey) {
            await idempotencyKeyModel.create({
                key: idempotencyKey,
                response
            });
        }

        return res.status(201).json(response)
    } catch (err) {
        console.error(`Error Creating User: ${err.message}`);
        return res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "Something went wrong on the server"
            }
        })
    }
}

module.exports.loginUser = async (req, res) => {
    
    const { email, password } = req.body;
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) return res.status(400).json({
        error: {
            code: "FIELDS_REQUIRED",
            fields: missingFields,
            message: `The following fields are required: ${missingFields.join(', ')}`
        }
    });

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).json({
            error: {
                code: "INVALID_CREDENTIALS",
                message: "Email or password is incorrect"
            }
        });
        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) return res.status(401).json({
            error: {
                code: "INVALID_CREDENTIALS",
                message: "Email or password is incorrect"
            }
        })
        const token = generateToken(user._id, user.email, user.role);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    status: user.status,
                    role: user.role,
                    createdAt: user.createdAt
                }
            }
        })
    } catch (err) {
        console.error(`Error Creating User: ${err.message}`);
        return res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "Something went wrong on the server"
            }
        })
    }
}

module.exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};