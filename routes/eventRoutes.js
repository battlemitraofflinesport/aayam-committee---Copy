const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const multer = require("multer");

// Multer config for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin middleware
const requireAdmin = (req, res, next) => {
   if (!req.session.user || (req.session.user.role !== "admin" && req.session.user.role !== "superadmin")) {
      return res.status(403).send("Access denied");
   }
   next();
};

/* ===============================
   PUBLIC ROUTES
================================ */
router.get("/events", eventController.getEventsPage);
router.get("/events/:id", eventController.getEventDetail);

/* ===============================
   ADMIN ROUTES
================================ */
router.post("/events/add", requireAdmin, upload.single("bannerImage"), eventController.addEvent);
router.post("/events/delete/:id", requireAdmin, eventController.deleteEvent);
router.post("/events/move-to-past/:id", requireAdmin, eventController.moveToPast);

module.exports = router;
