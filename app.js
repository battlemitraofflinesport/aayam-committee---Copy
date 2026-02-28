/* ===============================
   ENV & CORE IMPORTS
================================ */
require("dotenv").config();
const express = require("express");
const path = require("path");

/* ===============================
   VIEW & SESSION PACKAGES
================================ */
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");

/* ===============================
   APP INIT
================================ */
const app = express();

// Trust proxy for Vercel
app.set("trust proxy", 1);

/* ===============================
   MIDDLEWARES
================================ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ✅ SESSION */
app.use(session({
   secret: process.env.SESSION_SECRET || "aayam-secret-key-change-in-production",
   resave: false,
   saveUninitialized: true,  // Changed to true for debugging
   cookie: { 
      secure: false,  // Set to false for testing - change to true only with HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
   }
}));

/* ✅ STATIC FILES */
app.use(express.static(path.join(__dirname, "public")));

/* ✅ VERY IMPORTANT — UPLOADS MUST BE EXPOSED LIKE THIS */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===============================
   GLOBAL USER (NAVBAR ACCESS)
================================ */
app.use((req, res, next) => {
   res.locals.user = req.session.user || null;
   console.log("=== SESSION DEBUG ===");
   console.log("Session ID:", req.sessionID);
   console.log("Session:", req.session);
   console.log("User:", req.session?.user);
   next();
});

/* ===============================
   EJS + LAYOUT SETUP
================================ */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

/* ===============================
   ROUTES
================================ */
const homeRoutes = require("./routes/homeRoutes");
const teamRoutes = require("./routes/teamRoutes");
const homeController = require("./controllers/homeController");
const eventRoutes = require("./routes/eventRoutes");
const reachOutRoutes = require("./routes/reachOutRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use(homeRoutes);
app.use(teamRoutes);
app.use(eventRoutes);
app.use(reachOutRoutes);
app.use(authRoutes);
app.use(adminRoutes);

/* ERROR HANDLING */
app.use((err, req, res, next) => {
   console.error("=== ERROR ===");
   console.error(err.stack);
   res.status(500).send("Internal Server Error: " + err.message);
});

/* HOME */
app.get("/", homeController.getHome);

/* ===============================
   SERVER / VERCEL EXPORT
================================ */
const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== 'production') {
   app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
   });
}

// Export for Vercel serverless
module.exports = app;
