import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const BASE_URL = process.env.PUBLIC_API_URL; // example: https://xxxx.phanneldeliver.my.id

// ✅ lock everything to /public
const PUBLIC_ROOT = path.resolve(process.cwd(), "public");

function normalizeRel(p) {
  // remove leading slashes, normalize windows slashes, prevent weird null bytes
  return String(p || "")
    .replace(/\0/g, "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");
}

function safeResolveInsidePublic(relPath) {
  const rel = normalizeRel(relPath);
  const abs = path.resolve(PUBLIC_ROOT, rel);

  // ✅ prevent ../../ traversal
  if (!abs.startsWith(PUBLIC_ROOT)) return null;

  return { abs, rel };
}

router.get("/list", (req, res) => {
  const queryPath = req.query.path || "";
  const resolved = safeResolveInsidePublic(queryPath);

  if (!resolved) {
    return res.status(400).json({ error: "Invalid path" });
  }

  const { abs: targetDir, rel: safeRel } = resolved;

  try {
    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: "Directory not found" });
    }

    const stat = fs.statSync(targetDir);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: "Path is not a directory" });
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true });

    const folders = entries
      .filter((e) => e.isDirectory())
      .map((e) => ({
        name: e.name,
        path: path.posix.join(safeRel, e.name).replace(/^\/+/, ""),
      }));

    const files = entries
      .filter((e) => e.isFile())
      .filter((e) => /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(e.name))
      .map((e) => {
        const fileRel = path.posix.join(safeRel, e.name).replace(/^\/+/, "");
        return {
          name: e.name,
          path: fileRel,
          url: `${BASE_URL}/${fileRel}`,
        };
      });

    // breadcrumbs
    const parts = safeRel.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "public", path: "" }];
    parts.forEach((part, idx) => {
      breadcrumbs.push({
        name: part,
        path: parts.slice(0, idx + 1).join("/"),
      });
    });

    return res.json({
      path: safeRel,
      folders,
      files,
      breadcrumbs,
    });
  } catch (err) {
    console.error("❌ File browser list error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
