import multer from "multer";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { success, failure } from "../utils/response.js";

const upload = multer({ storage: multer.memoryStorage() });

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
