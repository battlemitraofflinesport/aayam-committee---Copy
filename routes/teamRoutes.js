const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const multer = require("multer");
const path = require("path");

// Multer config for image uploads
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "uploads/");
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
   }
});
const upload = multer({ storage });

// Admin middleware
const requireAdmin = (req, res, next) => {
   if (!req.session.user || (req.session.user.role !== "admin" && req.session.user.role !== "superadmin")) {
      return res.status(403).send("Access denied");
   }
   next();
};

/* ===============================
   VIEW TEAM PAGE
================================ */
router.get("/team", teamController.getTeamPage);

/* ===============================
   TEAM MANAGEMENT (Admin only)
================================ */

// POST /team/member/add - Add new member
router.post("/team/member/add", requireAdmin, upload.single("image"), teamController.addMember);

// POST /team/member/delete/:id - Delete member
router.post("/team/member/delete/:id", requireAdmin, teamController.deleteMember);

// GET /team/member/edit/:id - Edit member page
router.get("/team/member/edit/:id", requireAdmin, teamController.getEditMember);

// POST /team/member/edit/:id - Save edited member
router.post("/team/member/edit/:id", requireAdmin, upload.single("image"), teamController.editMember);

// POST /team/section/add - Add new section
router.post("/team/section/add", requireAdmin, teamController.addSection);

module.exports = router;
