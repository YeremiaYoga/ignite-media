import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// 📁 Akar folder untuk profile picture
const ROOT = path.join(process.cwd(), "public/profile_picture");
const BASE_URL = process.env.PUBLIC_API_URL;

/**
 * GET /profile-picture/list
 * Contoh: /profile-picture/list?path=subfolder
 */
router.get("/list", (req, res) => {
  const queryPath = req.query.path || "";
  const targetDir = path.join(ROOT, queryPath);

  try {
    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: "Directory not found" });
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true });

    // 📂 Ambil semua folder
    const folders = entries
      .filter((e) => e.isDirectory())
      .map((e) => ({
        name: e.name,
        path: path.join(queryPath, e.name).replace(/\\/g, "/"),
      }));

    // 🖼️ Ambil semua file gambar (png, jpg, jpeg, dll)
    const files = entries
      .filter((e) => e.isFile())
      .filter((e) => /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(e.name))
      .map((e) => ({
        name: e.name,
        path: path.join(queryPath, e.name).replace(/\\/g, "/"),
        url: `${BASE_URL}/profile_picture/${path
          .join(queryPath, e.name)
          .replace(/\\/g, "/")}`,
      }));

    // 🧭 Breadcrumbs
    const parts = queryPath.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "profile_picture", path: "" }];
    parts.forEach((part, idx) => {
      breadcrumbs.push({
        name: part,
        path: parts.slice(0, idx + 1).join("/"),
      });
    });

    res.json({ path: queryPath, folders, files, breadcrumbs });
  } catch (err) {
    console.error("❌ Profile picture list error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
