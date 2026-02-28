const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

try {
   if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
   }
} catch (err) {
   console.error("Supabase init error in ReachOut model:", err);
}

class ReachOut {
   constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.email = data.email;
      this.contact = data.contact;
      this.purpose = data.purpose;
      this.message = data.message;
      this.isRead = data.is_read || data.isRead || false;
      this.createdAt = data.created_at || data.createdAt;
   }

   static async create(data) {
      if (!supabase) {
         throw new Error("Supabase not configured");
      }
      const { data: result, error } = await supabase
         .from("reachout")
         .insert({
            name: data.name,
            email: data.email,
            contact: data.contact,
            purpose: data.purpose,
            message: data.message,
            is_read: false
         })
         .select()
         .single();

      if (error) throw error;
      return new ReachOut(result);
   }

   static async find() {
      if (!supabase) {
         throw new Error("Supabase not configured");
      }
      const { data, error } = await supabase
         .from("reachout")
         .select("*")
         .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(item => new ReachOut(item));
   }

   static async findById(id) {
      if (!supabase) {
         throw new Error("Supabase not configured");
      }
      const { data, error } = await supabase
         .from("reachout")
         .select("*")
         .eq("id", id)
         .single();

      if (error) throw error;
      if (!data) return null;
      return new ReachOut(data);
   }

   static async findByIdAndDelete(id) {
      if (!supabase) {
         throw new Error("Supabase not configured");
      }
      const { error } = await supabase
         .from("reachout")
         .delete()
         .eq("id", id);

      if (error) throw error;
      return { id };
   }

   async save() {
      if (!supabase) {
         throw new Error("Supabase not configured");
      }
      const { error } = await supabase
         .from("reachout")
         .update({
            is_read: this.isRead
         })
         .eq("id", this.id);

      if (error) throw error;
      return this;
   }
}

module.exports = ReachOut;
