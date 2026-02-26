/* ===============================
   AUTH CONTROLLER
================================ */

/**
 * GET /auth - Render main auth page (login/signup)
 */
exports.getAuth = (req, res) => {
   res.render("auth/index", { 
      title: "Login - AAYAM Committee",
      error: null 
   });
};

/**
 * POST /auth/email - Handle email/password login or register
 */
exports.postEmailAuth = (req, res) => {
   const { mode, email, password, name } = req.body;
   
   // Placeholder - implement actual auth logic
   // For now, just show the auth page with a message
   res.render("auth/index", { 
      title: "Login - AAYAM Committee",
      error: "Email authentication coming soon. Please use Google login."
   });
};

/**
 * GET /auth/google - Initiate Google OAuth
 */
exports.getGoogleAuth = (req, res) => {
   // Placeholder - redirect to auth page for now
   // Implement actual Google OAuth when ready
   res.redirect("/auth");
};

/**
 * GET /auth/google/callback - Handle Google OAuth callback
 */
exports.getGoogleCallback = (req, res) => {
   // Placeholder
   res.redirect("/");
};

/**
 * GET /logout - Logout user
 */
exports.logout = (req, res) => {
   // Placeholder - implement session clearing
   res.redirect("/");
};

/**
 * GET /forgot-password - Render forgot password page
 */
exports.getForgotPassword = (req, res) => {
   res.render("auth/forgot", { 
      title: "Forgot Password - AAYAM Committee" 
   });
};

/**
 * POST /forgot-password - Handle forgot password request
 */
exports.postForgotPassword = (req, res) => {
   const { email } = req.body;
   // Placeholder - implement password reset logic
   res.render("auth/forgot", { 
      title: "Forgot Password - AAYAM Committee",
      message: "If an account exists with this email, you will receive a password reset link."
   });
};

/**
 * GET /reset-password/:token - Render reset password page
 */
exports.getResetPassword = (req, res) => {
   const { token } = req.params;
   // Placeholder - validate token
   res.render("auth/reset", { 
      title: "Reset Password - AAYAM Committee",
      token 
   });
};

/**
 * POST /reset-password/:token - Handle password reset
 */
exports.postResetPassword = (req, res) => {
   const { token } = req.params;
   const { password, confirmPassword } = req.body;
   // Placeholder - implement password reset
   res.redirect("/auth");
};
