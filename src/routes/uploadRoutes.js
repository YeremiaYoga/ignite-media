import express from "express";
import { uploadFile } from "../controllers/uploadController.js";
import { verifyUserFullAuth } from "../middlewares/verifyUserFullAuth.js";

const router = express.Router();


router.post("/", verifyUserFullAuth, uploadFile);

export default router;
