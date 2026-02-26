const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin middleware - check if user is admin
const requireAdmin = (req, res, next) => {
   if (!req.session.user) {
      return res.redirect("/auth");
   }
   if (req.session.user.role !== "admin" && req.session.user.role !== "superadmin") {
      return res.status(403).send("Access denied");
   }
   next();
};

/* ===============================
   ADMIN ROUTES
================================ */

// GET /admin - Admin dashboard
router.get("/admin", requireAdmin, adminController.getDashboard);

// GET /admin/users - Manage users
router.get("/admin/users", requireAdmin, adminController.getUsers);

// GET /admin/reachout - Manage reach out submissions
router.get("/admin/reachout", requireAdmin, adminController.getReachOut);

module.exports = router;
