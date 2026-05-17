import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes   from "./routes/auth.routes.js";
import siswaRoutes  from "./routes/siswa.routes.js";
import guruRoutes   from "./routes/guru.routes.js";
import adminRoutes  from "./routes/admin.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ── Routes ──
app.use("/api/auth",  authRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/guru",  guruRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "API SMA Budi Mulia berjalan ✅" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));