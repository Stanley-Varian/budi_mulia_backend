import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  getJadwal,
  getMapelList,
  getMateriByMapel,
  getPengumuman,
  getPengumumanDetail,
  getEkskul,
  getProfil,
  joinKelas,
  getKelasSiswa,
} from "../controllers/siswa.controller.js";

const router = express.Router();

// Semua route siswa wajib login dan hanya bisa diakses role siswa
router.use(protect);
router.use(authorizeRoles("siswa"));

// ── Profil ──────────────────────────────────────────────────────────────────
// GET /api/siswa/profil
router.get("/profil", getProfil);

// ── Jadwal ──────────────────────────────────────────────────────────────────
// GET /api/siswa/jadwal
// GET /api/siswa/jadwal?tahunAjaran=2024/2025
router.get("/jadwal", getJadwal);

// ── Kelas ───────────────────────────────────────────────────────────────────
// POST /api/siswa/kelas/join   → join kelas dengan kode dari guru
// GET  /api/siswa/kelas        → daftar kelas yang sudah diikuti
router.post("/kelas/join", joinKelas);
router.get("/kelas", getKelasSiswa);

// ── Materi ──────────────────────────────────────────────────────────────────
// GET /api/siswa/materi              → daftar mapel (grid card dashboard)
// GET /api/siswa/materi/:mapel       → daftar materi per mapel
router.get("/materi", getMapelList);
router.get("/materi/:mapel", getMateriByMapel);

// ── Pengumuman ───────────────────────────────────────────────────────────────
// GET /api/siswa/pengumuman
// GET /api/siswa/pengumuman/:id
router.get("/pengumuman", getPengumuman);
router.get("/pengumuman/:id", getPengumumanDetail);

// ── Ekskul ───────────────────────────────────────────────────────────────────
// GET /api/siswa/ekskul
router.get("/ekskul", getEkskul);

export default router;