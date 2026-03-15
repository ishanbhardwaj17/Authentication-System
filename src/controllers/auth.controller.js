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

        const token = jwt.sign({
            id: user._id
        }, config.JWT_SECRET,
            {
                expiresIn: config.JWT_EXPIRES_IN
            }
        )

        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
            },
            token
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

