/* ===============================
   AUTH CONTROLLER - SUPABASE
================================ */
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
exports.postEmailAuth = async (req, res) => {
   const { mode, email, password, name } = req.body;
   
   try {
      if (mode === "register") {
         // Sign up new user
         const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
               data: { full_name: name }
            }
         });

         if (error) {
            return res.render("auth/index", { 
               title: "Login - AAYAM Committee",
               error: error.message 
            });
         }

         // Registration successful
         return res.render("auth/index", { 
            title: "Login - AAYAM Committee",
            error: null,
            message: "Registration successful! Please check your email to confirm your account."
         });
      } else {
         // Login existing user
         const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
         });

         if (error) {
            return res.render("auth/index", { 
               title: "Login - AAYAM Committee",
               error: error.message 
            });
         }

         // Store user session (you may want to use express-session for production)
         res.locals.user = data.user;
         
         // Redirect to home or dashboard
         return res.redirect("/");
      }
   } catch (err) {
      console.error("Auth error:", err);
      return res.render("auth/index", { 
         title: "Login - AAYAM Committee",
         error: "An unexpected error occurred. Please try again."
      });
   }
};

/**
 * GET /auth/google - Initiate Google OAuth
 */
exports.getGoogleAuth = async (req, res) => {
   try {
      const { data, error } = await supabase.auth.signInWithOAuth({
         provider: "google",
         options: {
            redirectTo: `${req.protocol}://${req.get("host")}/auth/google/callback`
         }
      });

      if (error) {
         return res.render("auth/index", { 
            title: "Login - AAYAM Committee",
            error: error.message 
         });
      }

      res.redirect(data.url);
   } catch (err) {
      console.error("Google auth error:", err);
      res.redirect("/auth");
   }
};

/**
 * GET /auth/google/callback - Handle Google OAuth callback
 */
exports.getGoogleCallback = async (req, res) => {
   // Supabase handles the callback via URL hash/params
   // The session is automatically set in the client
   res.redirect("/");
};

/**
 * GET /logout - Logout user
 */
exports.logout = async (req, res) => {
   try {
      await supabase.auth.signOut();
      res.locals.user = null;
      res.redirect("/");
   } catch (err) {
      console.error("Logout error:", err);
      res.redirect("/");
   }
};

/**
 * GET /forgot-password - Render forgot password page
 */
exports.getForgotPassword = (req, res) => {
   res.render("auth/forgot", { 
      title: "Forgot Password - AAYAM Committee",
      message: null
   });
};

/**
 * POST /forgot-password - Handle forgot password request
 */
exports.postForgotPassword = async (req, res) => {
   const { email } = req.body;
   
   try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
         redirectTo: `${req.protocol}://${req.get("host")}/reset-password`
      });

      if (error) {
         return res.render("auth/forgot", { 
            title: "Forgot Password - AAYAM Committee",
            error: error.message
         });
      }

      res.render("auth/forgot", { 
         title: "Forgot Password - AAYAM Committee",
         message: "If an account exists with this email, you will receive a password reset link."
      });
   } catch (err) {
      console.error("Forgot password error:", err);
      res.render("auth/forgot", { 
         title: "Forgot Password - AAYAM Committee",
         error: "An unexpected error occurred. Please try again."
      });
   }
};

/**
 * GET /reset-password/:token - Render reset password page
 */
exports.getResetPassword = (req, res) => {
   const { token } = req.params;
   res.render("auth/reset", { 
      title: "Reset Password - AAYAM Committee",
      token,
      error: null
   });
};

/**
 * POST /reset-password/:token - Handle password reset
 */
exports.postResetPassword = async (req, res) => {
   const { token } = req.params;
   const { password } = req.body;
   
   try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
         return res.render("auth/reset", { 
            title: "Reset Password - AAYAM Committee",
            token,
            error: error.message
         });
      }

      res.redirect("/auth");
   } catch (err) {
      console.error("Reset password error:", err);
      res.render("auth/reset", { 
         title: "Reset Password - AAYAM Committee",
         token,
         error: "An unexpected error occurred. Please try again."
      });
   }
};
