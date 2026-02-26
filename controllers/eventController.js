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
