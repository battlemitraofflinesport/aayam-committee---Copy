const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const multer = require("multer");
const https = require("https");
const url = require("url");

// Multer config for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Proxy route for serving images through same domain (bypasses CORS)
router.get("/proxy-image", (req, res) => {
   const imageUrl = req.query.url;
   if (!imageUrl) {
      return res.status(400).send("URL required");
   }

   // Validate URL is from trusted source
   if (!imageUrl.includes("supabase.co") && !imageUrl.includes("supabase.in")) {
      return res.status(403).send("Invalid URL");
   }

   try {
      const parsedUrl = new URL(imageUrl);
      const options = {
         hostname: parsedUrl.hostname,
         path: parsedUrl.pathname + parsedUrl.search,
         method: "GET",
         headers: {
            "Accept": "image/*, */*"
         },
         timeout: 10000
      };

      const proxyReq = https.request(options, (proxyRes) => {
         if (proxyRes.statusCode !== 200) {
            return res.status(proxyRes.statusCode).send("Failed to fetch image");
         }

         res.setHeader("Content-Type", proxyRes.headers["content-type"] || "image/jpeg");
         res.setHeader("Cache-Control", "public, max-age=86400");
         proxyRes.pipe(res);
      });

      proxyReq.on("error", (err) => {
         console.error("Proxy image error:", err.message);
         res.status(500).send("Failed to load image");
      });

      proxyReq.on("timeout", () => {
         proxyReq.destroy();
         res.status(504).send("Image request timeout");
      });

      proxyReq.end();
   } catch (err) {
      console.error("Proxy URL parse error:", err.message);
      res.status(400).send("Invalid URL format");
   }
});

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
router.post("/events/:id/conducted-by/:index/delete", requireAdmin, eventController.deleteConductedBy);
router.post("/events/:id/gallery", requireAdmin, upload.single("galleryImage"), eventController.addGalleryImage);
router.post("/events/:id/gallery/:index/delete", requireAdmin, eventController.deleteGalleryImage);
router.post("/events/:id/documents", requireAdmin, upload.single("document"), eventController.addDocument);
router.post("/events/:id/documents/:index/delete", requireAdmin, eventController.deleteDocument);

module.exports = router;
