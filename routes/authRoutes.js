const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/* ===============================
   AUTH ROUTES
================================ */

// GET /auth - Main auth page (login/signup)
router.get("/auth", authController.getAuth);

// POST /auth/email - Email/password login/register
router.post("/auth/email", authController.postEmailAuth);

// GET /auth/google - Google OAuth login
router.get("/auth/google", authController.getGoogleAuth);

// GET /auth/google/callback - Google OAuth callback
router.get("/auth/google/callback", authController.getGoogleCallback);

// GET /logout - Logout
router.get("/logout", authController.logout);

// GET /forgot-password - Forgot password page
router.get("/forgot-password", authController.getForgotPassword);

// POST /forgot-password - Handle forgot password
router.post("/forgot-password", authController.postForgotPassword);

// GET /reset-password/:token - Reset password page
router.get("/reset-password/:token", authController.getResetPassword);

// POST /reset-password/:token - Handle reset password
router.post("/reset-password/:token", authController.postResetPassword);

module.exports = router;
