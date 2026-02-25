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

/* ===============================
   APP INIT
================================ */
const app = express();

/* ===============================
   MIDDLEWARES
================================ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ✅ STATIC FILES */
app.use(express.static(path.join(__dirname, "public")));

/* ✅ VERY IMPORTANT — UPLOADS MUST BE EXPOSED LIKE THIS */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===============================
   GLOBAL USER (NAVBAR ACCESS)
================================ */
app.use((req, res, next) => {
   res.locals.user = null; // Mock null user for frontend views
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

app.use(homeRoutes);
app.use(teamRoutes);
app.use(eventRoutes);
app.use(reachOutRoutes);

/* HOME */
app.get("/", homeController.getHome);

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`🚀 Server running on port ${PORT}`);
});
