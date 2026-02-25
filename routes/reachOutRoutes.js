const express = require("express");
const router = express.Router();
const reachOutController = require("../controllers/reachOutController");

/* ===============================
   PUBLIC ROUTES
================================ */
router.get("/reachout", reachOutController.getReachOutForm);
router.post("/reachout", reachOutController.submitReachOutForm);

module.exports = router;
