import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

/**
 * POST api/auth/register
 */
authRouter.post('/register',authController.register);

/**
 * GET /api/auth/get-me
 */
authRouter.get("/get-me", authController.getMe)

/**
 * GET /api/auth/refresh-token
 */
authRouter.get("/refresh-token", authController.refreshToken)

/**
 * POST /api/auth/logout
 */
authRouter.post("/logout", authController.logout)

/**
 * POST /api/auth/login
 */
authRouter.post("/login", authController.login)

/**
 * GET /api/auth/verify-email
 */
authRouter.post("/verify-email", authController.verifyEmail)

export default authRouter