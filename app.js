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

/* ===============================
   MIDDLEWARES
================================ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ✅ SESSION */
app.use(session({
   secret: process.env.SESSION_SECRET || "aayam-secret-key-change-in-production",
   resave: false,
   saveUninitialized: false,
   cookie: { 
      secure: process.env.NODE_ENV === "production",
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
   next();
});

/* ===============================
   EJS + LAYOUT SETUP
================================ */
app.set("view engine", "ejs");
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

app.use(homeRoutes);
app.use(teamRoutes);
app.use(eventRoutes);
app.use(reachOutRoutes);
app.use(authRoutes);

/* HOME */
app.get("/", homeController.getHome);

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`🚀 Server running on port ${PORT}`);
});
