import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import uploadRoutes from "./routes/uploadRoutes.js";
import assetRoutes from "./routes/assetsRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import calendarMoonRoutes from "./routes/calendarMoonRoutes.js";
import calendarSeasonRoutes from "./routes/calendarSeasonRoutes.js";
import fileBrowserRoutes from "./routes/fileBrowserRoutes.js";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: [
      process.env.NEXT_PUBLIC_APP_ORIGIN_1,
      process.env.NEXT_PUBLIC_APP_ORIGIN_2,
      process.env.NEXT_PUBLIC_APP_ORIGIN_3,
      process.env.NEXT_PUBLIC_APP_ORIGIN_4,
      process.env.NEXT_PUBLIC_APP_ORIGIN_5,
      process.env.NEXT_PUBLIC_APP_ORIGIN_6,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.static(path.resolve("public")));
app.use("/assets", assetRoutes);
app.use("/profile", profileRoutes);

app.use("/calendar/moon", calendarMoonRoutes);
app.use("/calendar/season", calendarSeasonRoutes);

app.use("/browser", fileBrowserRoutes);
app.use("/upload", uploadRoutes);

export default app;
