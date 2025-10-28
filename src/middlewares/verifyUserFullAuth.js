import jwt from "jsonwebtoken";
import supabase from "../utils/db.js";

export const verifyUserFullAuth = async (req, res, next) => {
  console.log("🧩 [Auth-Media] Starting verifyUserFullAuth...");

  try {
    // --- Ambil token dari Header atau Cookie ---
    const token =
      req.cookies?.ignite_access_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.warn("⚠️ [Auth-Media] No access token found.");
      return res.status(401).json({ error: "Missing access token" });
    }

    console.log(token);
    // --- Decode dulu biar tahu tipe tokennya ---
    let decoded = jwt.decode(token);
    if (!decoded) {
      console.warn("❌ [Auth-Media] Cannot decode token");
      return res.status(401).json({ error: "Invalid token structure" });
    }
  console.log(decoded);
    // --- Tentukan secret berdasarkan payload ---
    // Contoh payload dari Ignite: { email: "...", app: "ignite", exp: ... }
    const app = decoded.app;
  
    let secret =
      app === "admin"
        ? process.env.JWT_SECRET_ADMIN
        : process.env.JWT_SECRET_USER;

    // --- Verifikasi token ---
    try {
      decoded = jwt.verify(token, secret);
      console.log(`✅ [Auth-Media] ${app.toUpperCase()} token verified for:`, decoded.email);
    } catch (err) {
      console.warn(`❌ [Auth-Media] Invalid or expired ${app} JWT:`, err.message);
      return res.status(401).json({ error: "Invalid or expired JWT" });
    }

    // --- (Opsional) Verifikasi user di Supabase ---
    // Kalau media server juga punya koneksi Supabase, aktifkan bagian ini:
    const { data, error } = await supabase
      .from("users")
      .select("id, email, username, role")
      .eq("email", decoded.email)
      .single();

    if (error || !data) {
      console.warn(`❌ [Auth-Media] User not found in Supabase:`, decoded.email);
      return res.status(401).json({ error: "User not found in Supabase" });
    }

    console.log("✅ [Auth-Media] User verified in Supabase:", data.email);

    // --- Simpan ke request ---
    req.user = {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role,
      app,
      jwt: decoded,
    };

    next();
  } catch (err) {
    console.error("🔥 [Auth-Media] verifyUserFullAuth error:", err);
    res.status(500).json({ error: "Server error verifying user" });
  }
};
