/**
 * Auth Middleware - Check if user is admin
 */

// Check if user is admin
exports.isAdmin = (req, res, next) => {
   if (!req.session.user) {
      return res.redirect("/auth");
   }
   if (req.session.user.role !== "admin" && req.session.user.role !== "superadmin") {
      return res.status(403).send("Access denied");
   }
   next();
};
