import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("guru"));

// ── Stub endpoints — akan diimplementasi orang 3 ────────────────────────────

// GET /api/guru/profil
router.get("/profil", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3", data: req.user });
});

// GET /api/guru/jadwal
router.get("/jadwal", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

// GET /api/guru/materi/:kelasId
router.get("/materi/:kelasId", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

// POST /api/guru/materi
router.post("/materi", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

// PUT /api/guru/materi/:id
router.put("/materi/:id", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

// DELETE /api/guru/materi/:id
router.delete("/materi/:id", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

// GET /api/guru/pengumuman
router.get("/pengumuman", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

// POST /api/guru/pengumuman
router.post("/pengumuman", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

// PUT /api/guru/pengumuman/:id
router.put("/pengumuman/:id", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

// DELETE /api/guru/pengumuman/:id
router.delete("/pengumuman/:id", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3" });
});

export default router;