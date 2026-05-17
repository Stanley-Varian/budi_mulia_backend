import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

// ── Stub endpoints — akan diimplementasi orang 4 ────────────────────────────

// GET /api/admin/stats
router.get("/stats", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// GET /api/admin/users
router.get("/users", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// POST /api/admin/users
router.post("/users", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// PUT /api/admin/users/:id
router.put("/users/:id", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// POST /api/admin/jadwal/save
router.post("/jadwal/save", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// GET /api/admin/pengumuman
router.get("/pengumuman", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// POST /api/admin/pengumuman
router.post("/pengumuman", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// PUT /api/admin/pengumuman/:id
router.put("/pengumuman/:id", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

// DELETE /api/admin/pengumuman/:id
router.delete("/pengumuman/:id", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 4" });
});

export default router;