const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const multer = require("multer");

// Multer config for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin middleware
const requireAdmin = (req, res, next) => {
   console.log("=== EVENT ADMIN CHECK ===");
   console.log("Session:", req.session);
   console.log("User:", req.session?.user);
   console.log("Role:", req.session?.user?.role);
   
   if (!req.session.user || (req.session.user.role !== "admin" && req.session.user.role !== "superadmin")) {
      console.log("Access denied - User or role mismatch");
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

// Edit event
router.get("/events/edit/:id", requireAdmin, eventController.getEditEvent);
router.post("/events/edit/:id", requireAdmin, upload.single("bannerImage"), eventController.updateEvent);

// Event details management
router.post("/events/:id/conducted-by", requireAdmin, eventController.addConductedBy);
router.post("/events/:id/gallery", requireAdmin, upload.single("galleryImage"), eventController.addGalleryImage);
router.post("/events/:id/gallery/:index/delete", requireAdmin, eventController.deleteGalleryImage);
router.post("/events/:id/documents", requireAdmin, eventController.addDocument);

module.exports = router;
