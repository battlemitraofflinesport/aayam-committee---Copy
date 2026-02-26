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
      let admins = [];
      if (supabase) {
         const { data } = await supabase.from("users").select("*");
         if (data) admins = data;
      }

      res.render("admin/index", {
         title: "Admin Dashboard - AAYAM Committee",
         user: req.session.user,
         admins
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

/**
 * POST /admin/invite - Invite new admin (superadmin only)
 */
exports.inviteAdmin = async (req, res) => {
   try {
      // Only superadmin can invite
      if (req.session.user.role !== "superadmin") {
         return res.status(403).send("Only superadmin can invite new admins");
      }

      const { email, password } = req.body;

      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
         email,
         password,
         email_confirm: true
      });

      if (authError) {
         console.error("Auth error:", authError);
         return res.status(400).send("Failed to create user: " + authError.message);
      }

      // Add to users table with admin role
      const { error: dbError } = await supabase.from("users").insert({
         email,
         role: "admin",
         isActive: true
      });

      if (dbError) {
         console.error("DB error:", dbError);
         // Don't fail - auth user is already created
      }

      res.redirect("/admin");
   } catch (err) {
      console.error("Invite admin error:", err);
      res.status(500).send("Error inviting admin");
   }
};
