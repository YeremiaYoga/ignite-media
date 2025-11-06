import multer from "multer";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { success, failure } from "../utils/response.js";

const upload = multer({ storage: multer.memoryStorage() });

/**
 * 📤 UPLOAD FILE
 */
export const uploadFile = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { path: basePath, folder_name } = req.body || {};

      if (!req.file) return failure(res, "No file uploaded", 400);
      if (!basePath) return failure(res, "Missing path", 400);
      if (!folder_name) return failure(res, "Missing folder_name", 400);

      const safePath = `${basePath}/${folder_name}`.replace(/[^a-zA-Z0-9/_-]/g, "");
      const dir = path.join("public", safePath);

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${Date.now()}${nanoid(8)}${ext}`;
      const filePath = path.join(dir, filename);

      fs.writeFileSync(filePath, req.file.buffer);

      const url = `/${safePath}/${filename}`;
      const fullUrl = `${req.protocol}://${req.get("host")}${url}`;

      console.log("✅ File uploaded:", fullUrl);
      return success(res, { folder: safePath, filename, url, fullUrl });
    } catch (err) {
      console.error("💥 Upload error:", err);
      return failure(res, err.message, 500);
    }
  },
];

/**
 * 🗑️ HAPUS FILE
 * body: { file_path: "assets/icons/icon.png" }
 */
export const deleteFile = async (req, res) => {
  try {
    const { file_path } = req.body || {};
    if (!file_path) return failure(res, "Missing file_path", 400);

    const safePath = file_path.replace(/[^a-zA-Z0-9/_\-.]/g, "");
    const fullPath = path.join("public", safePath);

    if (!fs.existsSync(fullPath)) return failure(res, "File not found", 404);

    fs.unlinkSync(fullPath);
    console.log("🗑️ File deleted:", safePath);

    return success(res, { message: "File deleted", file: safePath });
  } catch (err) {
    console.error("💥 deleteFile error:", err);
    return failure(res, err.message, 500);
  }
};

/**
 * 🧹 HAPUS FOLDER DAN ISINYA
 * body: { folder_path: "assets/icons" }
 */
export const deleteFolder = async (req, res) => {
  try {
    const { folder_path } = req.body || {};
    if (!folder_path) return failure(res, "Missing folder_path", 400);

    const safePath = folder_path.replace(/[^a-zA-Z0-9/_\-.]/g, "");
    const fullPath = path.join("public", safePath);

    if (!fs.existsSync(fullPath)) return failure(res, "Folder not found", 404);

    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log("🧹 Folder deleted:", safePath);

    return success(res, { message: "Folder deleted", folder: safePath });
  } catch (err) {
    console.error("💥 deleteFolder error:", err);
    return failure(res, err.message, 500);
  }
};

/**
 * 🚚 PINDAHKAN FILE KE FOLDER LAIN
 * body: { from: "assets/icons/old.png", to: "assets/new-icons" }
 */
export const moveFile = async (req, res) => {
  try {
    const { from, to } = req.body || {};
    if (!from || !to) return failure(res, "Missing from/to path", 400);

    const safeFrom = from.replace(/[^a-zA-Z0-9/_\-.]/g, "");
    const safeTo = to.replace(/[^a-zA-Z0-9/_\-.]/g, "");

    const fromPath = path.join("public", safeFrom);
    if (!fs.existsSync(fromPath)) return failure(res, "Source file not found", 404);

    const destDir = path.join("public", safeTo);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const filename = path.basename(fromPath);
    const destPath = path.join(destDir, filename);

    fs.renameSync(fromPath, destPath);

    console.log("🚚 File moved:", safeFrom, "→", safeTo);

    return success(res, {
      message: "File moved",
      from: safeFrom,
      to: `${safeTo}/${filename}`,
    });
  } catch (err) {
    console.error("💥 moveFile error:", err);
    return failure(res, err.message, 500);
  }
};

/**
 * 📦 PINDAHKAN SELURUH FOLDER KE TEMPAT LAIN
 * body: { from: "assets/icons", to: "assets/archive/icons" }
 */
export const moveFolder = async (req, res) => {
  try {
    const { from, to } = req.body || {};
    if (!from || !to) return failure(res, "Missing from/to path", 400);

    const safeFrom = from.replace(/[^a-zA-Z0-9/_\-.]/g, "");
    const safeTo = to.replace(/[^a-zA-Z0-9/_\-.]/g, "");

    const fromPath = path.join("public", safeFrom);
    const toPath = path.join("public", safeTo);

    if (!fs.existsSync(fromPath)) return failure(res, "Source folder not found", 404);

    const parentDir = path.dirname(toPath);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

    fs.renameSync(fromPath, toPath);

    console.log("📦 Folder moved:", safeFrom, "→", safeTo);

    return success(res, { message: "Folder moved", from: safeFrom, to: safeTo });
  } catch (err) {
    console.error("💥 moveFolder error:", err);
    return failure(res, err.message, 500);
  }
};
