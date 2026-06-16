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
  leaveKelas,
} from "../controllers/siswa.controller.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("siswa"));

//Profil 
router.get("/profil", getProfil);

//Jadwal
router.get("/jadwal", getJadwal);

//Kelas 
router.post("/kelas/join", joinKelas);
router.get("/kelas", getKelasSiswa);
router.delete("/kelas/:id/leave", leaveKelas);

// ── Materi ──────────────────────────────────────────────────────────────────
router.get("/materi", getMapelList);
router.get("/materi/:mapel", getMateriByMapel);

// ── Pengumuman ───────────────────────────────────────────────────────────────
router.get("/pengumuman", getPengumuman);
router.get("/pengumuman/:id", getPengumumanDetail);

// ── Ekskul ───────────────────────────────────────────────────────────────────
router.get("/ekskul", getEkskul);

export default router;