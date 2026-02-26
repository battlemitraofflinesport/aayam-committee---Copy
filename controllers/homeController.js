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

exports.getHome = async (req, res) => {
   let whatWeDoImages = [];
   let eventImages = [];
   
   try {
      if (supabase) {
         // Fetch images from home_images table
         const { data: images } = await supabase.from("home_images").select("*");
         if (images) {
            whatWeDoImages = images.filter(img => img.section === "what_we_do");
            eventImages = images.filter(img => img.section === "events");
         }
      }
   } catch (err) {
      console.error("Error fetching home images:", err);
   }

   res.render("home", {
      whatWeDoImages,
      eventImages,
      user: req.session.user
   });
};

/**
 * POST /home/upload - Upload home image
 */
exports.uploadImage = async (req, res) => {
   try {
      const { section } = req.body;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      let imageUrl = null;

      // Handle image upload to Supabase Storage
      if (req.file) {
         const fileExt = req.file.originalname.split('.').pop();
         const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
         const filePath = `${fileName}`;

         const { error: uploadError } = await supabase.storage
            .from("home_images")
            .upload(filePath, req.file.buffer, {
               contentType: req.file.mimetype,
               upsert: false
            });

         if (uploadError) {
            console.error("Supabase storage upload error:", uploadError);
            return res.status(500).send("Failed to upload image: " + uploadError.message);
         }

         const { data: publicUrlData } = supabase.storage
            .from("home_images")
            .getPublicUrl(filePath);

         imageUrl = publicUrlData.publicUrl;
      }

      // Insert into home_images table
      const { error } = await supabase.from("home_images").insert({
         image: imageUrl,
         section: section
      });

      if (error) {
         return res.status(400).send("Failed to add image: " + error.message);
      }

      res.redirect("/");
   } catch (err) {
      console.error("Upload image error:", err);
      res.status(500).send("Error uploading image");
   }
};

/**
 * POST /home/delete/:id - Delete home image
 */
exports.deleteImage = async (req, res) => {
   try {
      const { id } = req.params;

      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      const { error } = await supabase.from("home_images").delete().eq("id", id);

      if (error) {
         return res.status(400).send("Failed to delete image: " + error.message);
      }

      res.redirect("/");
   } catch (err) {
      console.error("Delete image error:", err);
      res.status(500).send("Error deleting image");
   }
};
