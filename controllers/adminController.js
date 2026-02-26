/* ===============================
   ADMIN CONTROLLER
================================ */
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key for admin operations (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

try {
   if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
   }
} catch (err) {
   console.error("Supabase init error:", err);
}

/**
 * GET /admin - Admin dashboard
 */
exports.getDashboard = async (req, res) => {
   try {
      res.render("admin/index", {
         title: "Admin Dashboard - AAYAM Committee",
         user: req.session.user
      });
   } catch (err) {
      console.error("Dashboard error:", err);
      res.status(500).send("Error loading admin dashboard");
   }
};

/**
 * GET /admin/users - Manage users
 */
exports.getUsers = async (req, res) => {
   let users = [];
   try {
      if (supabase) {
         const { data } = await supabase.from("users").select("*");
         if (data) users = data;
      }
   } catch (err) {
      console.error("Error fetching users:", err);
   }

   res.render("admin/users/index", {
      title: "Manage Users - AAYAM Committee",
      user: req.session.user,
      users
   });
};

/**
 * GET /admin/reachout - Manage reach out submissions
 */
exports.getReachOut = async (req, res) => {
   let submissions = [];
   try {
      if (supabase) {
         const { data } = await supabase.from("reachout").select("*").order("created_at", { ascending: false });
         if (data) submissions = data;
      }
   } catch (err) {
      console.error("Error fetching reachout:", err);
   }

   res.render("admin/reachout/index", {
      title: "Reach Out Submissions - AAYAM Committee",
      user: req.session.user,
      submissions
   });
};
