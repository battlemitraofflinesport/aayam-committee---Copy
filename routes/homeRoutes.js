const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
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

// POST /home/upload - Upload home image (Our Activities / Moments That Matter)
router.post("/home/upload", requireAdmin, upload.single("image"), homeController.uploadImage);

// POST /home/delete/:id - Delete home image
router.post("/home/delete/:id", requireAdmin, homeController.deleteImage);

module.exports = router;
