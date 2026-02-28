/* ===============================
   SHOW FORM (PUBLIC)
================================ */
exports.getReachOutForm = (req, res) => {
  res.render("reachout/index", {
    success: req.query.success || false,
    user: req.session.user || null,
    upcomingEvents: [],
    pastEvents: []
  });
};

/* ===============================
   SUBMIT FORM (PUBLIC)
================================ */
exports.submitReachOutForm = (req, res) => {
  // Simply mock successful submission
  res.redirect("/reachout?success=true");
};


