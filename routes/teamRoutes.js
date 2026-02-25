const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");

/* ===============================
   VIEW TEAM PAGE
================================ */
router.get("/team", teamController.getTeamPage);

module.exports = router;
