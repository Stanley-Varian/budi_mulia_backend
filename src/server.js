import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import materiRoutes from "./routes/materi.js";
import jadwalRoutes from "./routes/jadwal.js";
import pengumumanRoutes from "./routes/pengumuman.js";
import ekskulRoutes from "./routes/ekskul.js";

dotenv.config();
connectDB();

const app = express();

// middleware
app.use(cors({
  origin: "http://localhost:3000", // frontend
}));
app.use(express.json());

// routes
app.use("/api/materis", materiRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/pengumuman", pengumumanRoutes);
app.use("/api/ekskul", ekskulRoutes);
app.use("/uploads", express.static("uploads"));

// health check
app.get("/", (req, res) => {
  res.json({ message: "API running 🚀" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running 🚀");
});

