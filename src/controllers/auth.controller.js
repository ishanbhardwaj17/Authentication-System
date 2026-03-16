import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import config from "../config/config.js";
import redis from "../config/cache.js";


/*
   REGISTER
*/
export async function register(req, res) {
    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const userExist = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (userExist) {
            return res.status(409).json({
                message: "Username or email already in use"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        /* ACCESS TOKEN */
        const accessToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "10m" }
        );

        /* REFRESH TOKEN */
        const refreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash: hashedRefreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        /* CACHE SESSION IN REDIS */
        await redis.set(
            `session:${user._id}`,
            JSON.stringify(session),
            "EX",
            7 * 24 * 60 * 60
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email
            },
            accessToken
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}


/*
   LOGIN
*/
export async function login(req, res) {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        /* FIND USER */
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        /* VERIFY PASSWORD */
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        /* GENERATE ACCESS TOKEN */
        const accessToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "10m" }
        );

        /* GENERATE REFRESH TOKEN */
        const refreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        /* HASH REFRESH TOKEN */
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        /* CREATE SESSION */
        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash: hashedRefreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        /* CACHE SESSION IN REDIS */
        await redis.set(
            `session:${user._id}`,
            JSON.stringify(session),
            "EX",
            7 * 24 * 60 * 60
        );

        /* SEND REFRESH TOKEN COOKIE */
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        /* RESPONSE */
        res.status(200).json({
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email
            },
            accessToken
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
}


/* 
   GET CURRENT USER
*/
export async function getMe(req, res) {

    try {

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token not found"
            });
        }

        /* CHECK REDIS BLACKLIST */
        const isBlackListed = await redis.get(`blacklist:${token}`);

        if (isBlackListed) {
            return res.status(401).json({
                message: "Token revoked"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(401).json({
            message: "Invalid token"
        });
    }
}


/* 
   REFRESH TOKEN
*/
export async function refreshToken(req, res) {

    try {

        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found"
            });
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

        let session = await redis.get(`session:${decoded.id}`);

        if (session) {

            session = JSON.parse(session);

        } else {

            session = await sessionModel.findOne({
                user: decoded.id
            });

            if (!session) {
                return res.status(401).json({
                    message: "Session not found"
                });
            }

            await redis.set(
                `session:${decoded.id}`,
                JSON.stringify(session),
                "EX",
                7 * 24 * 60 * 60
            );
        }

        /* VERIFY REFRESH TOKEN HASH */
        const isValid = await bcrypt.compare(
            refreshToken,
            session.refreshTokenHash
        );

        if (!isValid) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        /* CREATE NEW ACCESS TOKEN */
        const accessToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: "10m" }
        );

        /* ROTATE REFRESH TOKEN */
        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        const newHashedToken = await bcrypt.hash(newRefreshToken, 10);

        await sessionModel.updateOne(
            { user: decoded.id },
            { refreshTokenHash: newHashedToken }
        );

        /* UPDATE REDIS SESSION */
        await redis.set(
            `session:${decoded.id}`,
            JSON.stringify({
                ...session,
                refreshTokenHash: newHashedToken
            }),
            "EX",
            7 * 24 * 60 * 60
        );

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        });

    } catch (error) {

        console.error(error);

        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
}


/* 
   LOGOUT
*/
export async function logout(req, res) {

    try {

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token not found"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        /* BLACKLIST ACCESS TOKEN */
        await redis.set(
            `blacklist:${token}`,
            "true",
            "EX",
            expiresIn
        );

        /* DELETE SESSION */
        await sessionModel.deleteMany({
            user: decoded.id
        });

        /* DELETE REDIS SESSION CACHE */
        await redis.del(`session:${decoded.id}`);

        res.clearCookie("refreshToken");

        res.json({
            message: "Logged out successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Logout failed"
        });
    }
}

