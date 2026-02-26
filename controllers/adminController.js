/* ===============================
   ADMIN CONTROLLER
================================ */
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

try {
   if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
   }
} catch (err) {
   console.error("Supabase init error:", err);
}

/**
 * GET /admin - Admin dashboard
 */
exports.getDashboard = async (req, res) => {
   res.render("admin/index", {
      title: "Admin Dashboard - AAYAM Committee",
      user: req.session.user
   });
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
