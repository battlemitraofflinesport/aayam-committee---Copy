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

/* ===============================
   EVENTS LIST PAGE
================================ */
exports.getEventsPage = async (req, res) => {
   let upcomingEvents = [];
   let pastEvents = [];
   
   try {
      if (supabase) {
         const { data: events } = await supabase.from("events").select("*").order("start_date", { ascending: false });
         if (events) {
            upcomingEvents = events.filter(e => e.type === "upcoming");
            pastEvents = events.filter(e => e.type === "past");
         }
      }
   } catch (err) {
      console.error("Error fetching events:", err);
   }

   res.render("events/index", { upcomingEvents, pastEvents, user: req.session.user });
};

/* ===============================
   EVENT DETAIL PAGE
================================ */
exports.getEventDetail = async (req, res) => {
   try {
      if (supabase) {
         const { data: event } = await supabase.from("events").select("*").eq("id", req.params.id).single();
         if (event) {
            const isPast = event.type === "past";
            const { data: reviews } = await supabase.from("event_reviews").select("*").eq("event_id", req.params.id);
            return res.render("events/show", { event, isPast, reviews: reviews || [], user: req.session.user });
         }
      }
      res.status(404).send("Event not found");
   } catch (err) {
      console.error("Error fetching event detail:", err);
      res.status(500).send("Error loading event");
   }
};

/* ===============================
   ADD EVENT
================================ */
exports.addEvent = async (req, res) => {
   try {
      const { title, shortDescription, description, about, startDate, endDate, type, registrationLink } = req.body;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      let bannerImageUrl = null;

      // Handle image upload to Supabase Storage
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
            return res.status(500).send("Failed to upload image: " + uploadError.message);
         }

         const { data: publicUrlData } = supabase.storage
            .from("team_images")
            .getPublicUrl(filePath);

         bannerImageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("events").insert({
         title,
         short_description: shortDescription,
         description,
         about,
         start_date: startDate,
         end_date: endDate,
         type,
         banner_image: bannerImageUrl,
         registration_link: registrationLink
      });

      if (error) {
         return res.status(400).send("Failed to add event: " + error.message);
      }

      res.redirect("/events");
   } catch (err) {
      console.error("Add event error:", err);
      res.status(500).send("Error adding event");
   }
};

/* ===============================
   DELETE EVENT
================================ */
exports.deleteEvent = async (req, res) => {
   try {
      const { id } = req.params;

      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      // Delete related reviews first
      await supabase.from("event_reviews").delete().eq("event_id", id);

      // Delete event
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) {
         return res.status(400).send("Failed to delete event: " + error.message);
      }

      res.redirect("/events");
   } catch (err) {
      console.error("Delete event error:", err);
      res.status(500).send("Error deleting event");
   }
};

/* ===============================
   EDIT EVENT PAGE
================================ */
exports.getEditEvent = async (req, res) => {
   try {
      if (supabase) {
         const { data: event } = await supabase.from("events").select("*").eq("id", req.params.id).single();
         if (event) {
            return res.render("events/edit", { event, user: req.session.user });
         }
      }
      res.status(404).send("Event not found");
   } catch (err) {
      console.error("Error fetching event for edit:", err);
      res.status(500).send("Error loading event");
   }
};

/* ===============================
   UPDATE EVENT
================================ */
exports.updateEvent = async (req, res) => {
   try {
      const { id } = req.params;
      const { title, shortDescription, description, about, startDate, endDate, type, registrationLink } = req.body;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      let bannerImageUrl = null;

      // Handle image upload to Supabase Storage
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
            return res.status(500).send("Failed to upload image: " + uploadError.message);
         }

         const { data: publicUrlData } = supabase.storage
            .from("team_images")
            .getPublicUrl(filePath);

         bannerImageUrl = publicUrlData.publicUrl;
      }

      const updateData = {
         title,
         short_description: shortDescription,
         description,
         about,
         start_date: startDate,
         end_date: endDate,
         type,
         registration_link: registrationLink
      };

      if (bannerImageUrl) {
         updateData.banner_image = bannerImageUrl;
      }

      const { error } = await supabase.from("events").update(updateData).eq("id", id);

      if (error) {
         return res.status(400).send("Failed to update event: " + error.message);
      }

      res.redirect(`/events/${id}`);
   } catch (err) {
      console.error("Update event error:", err);
      res.status(500).send("Error updating event");
   }
};

/* ===============================
   ADD CONDUCTED BY
================================ */
exports.addConductedBy = async (req, res) => {
   try {
      const { id } = req.params;
      const { name, role, email } = req.body;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      // Get current conductedBy array
      const { data: event } = await supabase.from("events").select("conductedBy").eq("id", id).single();
      const conductedBy = event?.conductedBy || [];
      
      conductedBy.push({ name, role, email });

      const { error } = await supabase.from("events").update({ conductedBy }).eq("id", id);

      if (error) {
         return res.status(400).send("Failed to add conducted by: " + error.message);
      }

      res.redirect(`/events/${id}`);
   } catch (err) {
      console.error("Add conducted by error:", err);
      res.status(500).send("Error adding conducted by");
   }
};

/* ===============================
   ADD GALLERY IMAGE
================================ */
exports.addGalleryImage = async (req, res) => {
   try {
      const { id } = req.params;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      if (!req.file) {
         return res.status(400).send("No image provided");
      }

      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
         .from("team_images")
         .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
         });

      if (uploadError) {
         console.error("Supabase storage upload error:", uploadError);
         return res.status(500).send("Failed to upload image: " + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
         .from("team_images")
         .getPublicUrl(filePath);

      // Get current gallery array
      const { data: event } = await supabase.from("events").select("gallery_images").eq("id", id).single();
      const galleryImages = event?.gallery_images || [];
      
      galleryImages.push(publicUrlData.publicUrl);

      const { error } = await supabase.from("events").update({ gallery_images: galleryImages }).eq("id", id);

      if (error) {
         return res.status(400).send("Failed to add gallery image: " + error.message);
      }

      res.redirect(`/events/${id}`);
   } catch (err) {
      console.error("Add gallery image error:", err);
      res.status(500).send("Error adding gallery image");
   }
};

/* ===============================
   ADD DOCUMENT
================================ */
exports.addDocument = async (req, res) => {
   try {
      const { id } = req.params;
      const { title: docTitle, url } = req.body;
      
      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      // Get current documents array
      const { data: event } = await supabase.from("events").select("documents").eq("id", id).single();
      const documents = event?.documents || [];
      
      documents.push({ title: docTitle, url });

      const { error } = await supabase.from("events").update({ documents }).eq("id", id);

      if (error) {
         return res.status(400).send("Failed to add document: " + error.message);
      }

      res.redirect(`/events/${id}`);
   } catch (err) {
      console.error("Add document error:", err);
      res.status(500).send("Error adding document");
   }
};

/* ===============================
   MOVE EVENT TO PAST
================================ */
exports.moveToPast = async (req, res) => {
   try {
      const { id } = req.params;

      if (!supabase) {
         return res.status(500).send("Database not configured");
      }

      const { error } = await supabase.from("events").update({ type: "past" }).eq("id", id);

      if (error) {
         return res.status(400).send("Failed to move event: " + error.message);
      }

      res.redirect("/events");
   } catch (err) {
      console.error("Move to past error:", err);
      res.status(500).send("Error moving event");
   }
};


