import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  getStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  saveJadwal,
  getJadwal,
  getPengumuman,
  createPengumuman,
  updatePengumuman,
  deletePengumuman,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Semua route admin wajib login & role admin
router.use(protect);
router.use(authorizeRoles("admin"));

// ── Stats ────────────────────────────────────────────
router.get("/stats", getStats);

// ── User CRUD ────────────────────────────────────────
router.get("/users",        getUsers);
router.get("/users/:id",    getUserById);
router.post("/users",       createUser);
router.put("/users/:id",    updateUser);
router.delete("/users/:id", deleteUser);

// ── Jadwal ───────────────────────────────────────────
router.get("/jadwal",       getJadwal);
router.post("/jadwal/save", saveJadwal);

// ── Pengumuman ───────────────────────────────────────
router.get("/pengumuman",        getPengumuman);
router.post("/pengumuman",       createPengumuman);
router.put("/pengumuman/:id",    updatePengumuman);
router.delete("/pengumuman/:id", deletePengumuman);

export default router;
