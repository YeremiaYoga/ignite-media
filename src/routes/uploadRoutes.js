import express from "express";
import {
  uploadFile,
  deleteFile,
  deleteFolder,
  moveFile,
  moveFolder,
} from "../controllers/uploadController.js";
import { verifyUserFullAuth } from "../middlewares/verifyUserFullAuth.js";

const router = express.Router();

/**
 * 📤 Upload file (protected)
 */
router.post("/", verifyUserFullAuth, uploadFile);
router.delete("/file", verifyUserFullAuth, deleteFile);
router.delete("/folder", verifyUserFullAuth, deleteFolder);
router.put("/move-file", verifyUserFullAuth, moveFile);
router.put("/move-folder", verifyUserFullAuth, moveFolder);

export default router;
