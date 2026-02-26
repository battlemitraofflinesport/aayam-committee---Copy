/* ===============================
   VIEW TEAM PAGE
================================ */
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

try {
   if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
   }
} catch (err) {
   console.error("Supabase init error:", err);
}

const getTeamPage = async (req, res) => {
   let sections = [];
   try {
      if (supabase) {
         const { data: sectionsData } = await supabase.from("team_sections").select("*");
         if (sectionsData) {
            sections = sectionsData;
            // Fetch members for each section
            for (let section of sections) {
               const { data: membersData } = await supabase.from("team_members").select("*").eq("section_id", section.id);
               section.members = membersData || [];
            }
         }
      }
   } catch (err) {
      console.error("Error fetching team:", err);
   }

   res.render("team", { sections, user: req.session.user });
};

/**
 * POST /team/member/add - Add new team member
 */
const addMember = async (req, res) => {
   try {
      const { name, position, section_id } = req.body;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      const { error } = await supabase.from("team_members").insert({
         name,
         position,
         section_id,
         image: req.file ? "/uploads/" + req.file.filename : null
      });

      if (error) {
         return res.status(400).send("Failed to add member: " + error.message);
      }

      res.redirect("/team");
   } catch (err) {
      console.error("Add member error:", err);
      res.status(500).send("Error adding member");
   }
};

/**
 * POST /team/member/delete/:id - Delete team member
 */
const deleteMember = async (req, res) => {
   try {
      const { id } = req.params;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      const { error } = await supabase.from("team_members").delete().eq("id", id);

      if (error) {
         return res.status(400).send("Failed to delete member: " + error.message);
      }

      res.redirect("/team");
   } catch (err) {
      console.error("Delete member error:", err);
      res.status(500).send("Error deleting member");
   }
};

/**
 * GET /team/member/edit/:id - Edit member page
 */
const getEditMember = async (req, res) => {
   try {
      const { id } = req.params;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      const { data: member } = await supabase.from("team_members").select("*").eq("id", id).single();
      const { data: sections } = await supabase.from("team_sections").select("*");

      res.render("editMember", { member, sections, user: req.session.user });
   } catch (err) {
      console.error("Get edit member error:", err);
      res.status(500).send("Error loading edit page");
   }
};

/**
 * POST /team/member/edit/:id - Update team member
 */
const editMember = async (req, res) => {
   try {
      const { id } = req.params;
      const { name, position, section_id } = req.body;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      const updateData = {
         name,
         position,
         section_id
      };

      if (req.file) {
         updateData.image = "/uploads/" + req.file.filename;
      }

      const { error } = await supabase.from("team_members").update(updateData).eq("id", id);

      if (error) {
         return res.status(400).send("Failed to update member: " + error.message);
      }

      res.redirect("/team");
   } catch (err) {
      console.error("Edit member error:", err);
      res.status(500).send("Error updating member");
   }
};

/**
 * POST /team/section/add - Add new team section
 */
const addSection = async (req, res) => {
   try {
      const { title } = req.body;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      const { error } = await supabase.from("team_sections").insert({ title });

      if (error) {
         return res.status(400).send("Failed to add section: " + error.message);
      }

      res.redirect("/team");
   } catch (err) {
      console.error("Add section error:", err);
      res.status(500).send("Error adding section");
   }
};

module.exports = {
   getTeamPage,
   addMember,
   deleteMember,
   getEditMember,
   editMember,
   addSection
};
