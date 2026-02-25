const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

/* ===============================
   PUBLIC ROUTES
================================ */
router.get("/events", eventController.getEventsPage);
router.get("/events/:id", eventController.getEventDetail);

module.exports = router;
