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
      console.log("=== ADD MEMBER REQUEST ===");
      console.log("Body:", req.body);
      console.log("File:", req.file ? req.file.originalname : "No file");
      console.log("User:", req.session.user);
      
      const { name, position, section_id } = req.body;
      console.log("Extracted values:", { name, position, section_id });

      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      let imageUrl = null;

      // Handle image upload to Supabase Storage
      if (req.file) {
         console.log("Uploading file:", req.file.originalname, "Size:", req.file.size, "Type:", req.file.mimetype);
         
         const fileExt = req.file.originalname.split('.').pop();
         const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
         const filePath = `${fileName}`;

         console.log("Uploading to path:", filePath, "Bucket: team_images");

         const { error: uploadError, data: uploadData } = await supabase.storage
            .from("team_images")
            .upload(filePath, req.file.buffer, {
               contentType: req.file.mimetype,
               upsert: false
            });

         if (uploadError) {
            console.error("Supabase storage upload error:", JSON.stringify(uploadError));
            return res.status(500).send("Failed to upload image: " + uploadError.message);
         }

         console.log("Upload successful:", uploadData);

         const { data: publicUrlData } = supabase.storage
            .from("team_images")
            .getPublicUrl(filePath);

         imageUrl = publicUrlData.publicUrl;
         console.log("Image URL:", imageUrl);
      }

      const { error } = await supabase.from("team_members").insert({
         name,
         position,
         section: section_id,
         image: imageUrl
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
         section: section_id
      };

      if (req.file) {
         const fileExt = req.file.originalname.split('.').pop();
         const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
         const filePath = `${fileName}`;

         const { error: uploadError } = await supabase.storage
            .from("team_images")
            .upload(filePath, req.file.buffer, {
               contentType: req.file.mimetype,
               upsert: false
            });

         if (uploadError) {
            console.error("Supabase storage upload error:", uploadError);
            return res.status(500).send("Failed to upload image.");
         }

         const { data: publicUrlData } = supabase.storage
            .from("team_images")
            .getPublicUrl(filePath);

         updateData.image = publicUrlData.publicUrl;
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
