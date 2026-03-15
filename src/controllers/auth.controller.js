import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import config from "../config/config.js";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All the fields are required"
            })
        }

        const userExist = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (userExist) {
            return res.status(409).json({
                message: "Username or Email already in use"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        })

        const acessToken = jwt.sign({
            id: user._id
        }, config.JWT_SECRET,
            {
                expiresIn: "10m"
            }
        )

        const refreshToken = jwt.sign({
            id: user._id
        }, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRES_IN
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
            },
            acessToken
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function getMe(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "token not found"
            })
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "user fetched successfully",
            user: {
                username: user.username,
                email: user.email,
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(401).json({ message: "Invalid token" })
    }
}

export async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "refresh Token not found"
            })
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

        const accessToken = jwt.sign({
            id: decoded.id
        }, config.JWT_SECRET, { expiresIn: "10m" })

        const newRefreshToken = jwt.sign({
            id: decoded.id
        }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN })

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        })

    } catch (error) {
        console.error(error)
        return res.status(401).json({ message: "Invalid or expired refresh token" })
    }
}

