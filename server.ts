import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Supabase Admin Client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ukmaftgnructgcdaruby.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Middleware to verify Admin clearance
  const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header required" });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      // Fallback: check if it's a manual session (this is insecure without a token, 
      // but in this specific app's context, let's see how they handle it)
      // Actually, we should only trust the Supabase Auth User OR a verifiable admin identity.
      // For now, let's check the database for this user's role.
      if (!user) return res.status(401).json({ error: "Invalid token" });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user!.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      // Final bypass: check if they are the hardcoded primary admin email
      if (user?.email?.toLowerCase() !== 'achavezsalva@gmail.com') {
        return res.status(403).json({ error: "Administrative clearance required" });
      }
    }

    (req as any).adminUser = user;
    next();
  };

  // API Route: Change User Password
  app.post("/api/admin/update-password", verifyAdmin, async (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: "userId and newPassword are required" });
    }

    // UUID Regex
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    try {
      if (uuidRegex.test(userId)) {
        // Official Supabase Auth User
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: newPassword
        });

        if (error) throw error;
        
        // Also update access_key in users table as a unified credential sync
        await supabaseAdmin
          .from('users')
          .update({ access_key: newPassword })
          .eq('id', userId);

        res.json({ success: true, message: "Security credentials (Password & Access Key) synchronized and updated." });
      } else {
        // Pre-authorized or manual user (e.g. pre_auth:email or manual ID)
        // Update their access_key in the users table which acts as their password/key
        const { error } = await supabaseAdmin
          .from('users')
          .update({ access_key: newPassword })
          .eq('id', userId);

        if (error) throw error;

        res.json({ success: true, message: "Manual Access Key updated successfully for this specific personnel profile." });
      }
    } catch (error: any) {
      console.error("Password update failure:", error);
      res.status(500).json({ error: error.message || "Failed to update security credentials" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Supabase URL: ${supabaseUrl}`);
    if (!supabaseServiceKey) {
      console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. Admin auth actions will fail.");
    }
  });
}

startServer();
