import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5001;

console.log(process.env.PORT);
app.listen(PORT, () => {
  console.log(`🚀 Ignite Media running at http://localhost:${PORT}`);
});
