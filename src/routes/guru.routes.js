import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import Pengumuman from "../models/Pengumuman.js";
import Materi from "../models/Materi.js";
import upload from "../middleware/upload.js";
import Kelas from "../models/Kelas.js";
import Jadwal from "../models/Jadwal.js";
import {
  getProfilGuru,
  getJadwalGuru,
  getKelasGuru,
  getDetailKelasGuru,
  createKelas,
  updateKelas,
  deleteKelas,
  getSiswaKelas,
  getPengumumanGuru,
  getDetailPengumumanGuru,
  createPengumumanGuru,
  updatePengumumanGuru,
  deletePengumumanGuru,
} from "../controllers/guru.controller.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("guru"));

// ── Profil ───────────────────────────────────────────────────────────────────
router.get("/profil", (req, res) => {
  res.json({ success: true, message: "TODO: implementasi orang 3", data: req.user });
});

// ── Jadwal ───────────────────────────────────────────────────────────────────
router.get("/jadwal", async (req, res) => {
  try {
    const namaGuru = req.user.nama;
    const semuaJadwal = await Jadwal.find({});
    const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    const hasil = {};
    for (const hari of HARI) hasil[hari] = [];

    for (const doc of semuaJadwal) {
      for (const hari of HARI) {
        const hariData = doc.jadwal?.[hari]?.toObject
          ? doc.jadwal[hari].toObject()
          : doc.jadwal?.[hari];
        if (!hariData) continue;

        for (let jamKe = 1; jamKe <= 11; jamKe++) {
          const slot = hariData[String(jamKe)];
          if (slot && slot.guru?.trim() === namaGuru?.trim()) {
            hasil[hari].push({ jamKe, kelas: doc.kelas, mapel: slot.mapel });
          }
        }
      }
    }

    res.json({ success: true, data: hasil });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Kelas ────────────────────────────────────────────────────────────────────
router.get("/kelas", async (req, res) => {
  try {
    const kelasList = await Kelas.find({ guru: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: kelasList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/kelas/:id", async (req, res) => {
  try {
    const kelas = await Kelas.findOne({ _id: req.params.id, guru: req.user._id });
    if (!kelas) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan." });
    res.json({ success: true, data: kelas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/kelas", async (req, res) => {
  try {
    const { nama, mapel, kodeKelas } = req.body;
    if (!nama || !mapel || !kodeKelas) {
      return res.status(400).json({ success: false, message: "nama, mapel, dan kodeKelas wajib diisi." });
    }
    const exists = await Kelas.findOne({ kodeKelas: kodeKelas.toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Kode kelas sudah digunakan." });
    }
    const kelas = await Kelas.create({
      nama, mapel,
      kodeKelas: kodeKelas.toUpperCase(),
      guru: req.user._id,
      namaGuru: req.user.nama,
      anggota: [],
    });
    res.status(201).json({ success: true, message: "Kelas berhasil dibuat.", data: kelas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/kelas/:id", async (req, res) => {
  try {
    const kelas = await Kelas.findOne({ _id: req.params.id, guru: req.user._id });
    if (!kelas) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan." });
    const { nama, mapel } = req.body;
    if (nama !== undefined) kelas.nama = nama;
    if (mapel !== undefined) kelas.mapel = mapel;
    await kelas.save();
    res.json({ success: true, message: "Kelas berhasil diperbarui.", data: kelas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/kelas/:id", async (req, res) => {
  try {
    const kelas = await Kelas.findOneAndDelete({ _id: req.params.id, guru: req.user._id });
    if (!kelas) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan." });
    res.json({ success: true, message: "Kelas berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/kelas/:id/siswa", async (req, res) => {
  try {
    const kelas = await Kelas.findOne({ _id: req.params.id, guru: req.user._id }).populate("anggota", "-password");
    if (!kelas) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan." });
    res.json({ success: true, data: kelas.anggota });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Materi ───────────────────────────────────────────────────────────────────

// GET /api/guru/materi/:kelasId
router.get("/materi/:kelasId", async (req, res) => {
  try {
    const { kelasId } = req.params;

    const kelas = await Kelas.findOne({ _id: kelasId, guru: req.user._id });
    if (!kelas) {
      return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });
    }

    // ✅ FIX: query pakai kelasId (ObjectId ref), bukan kelas (string nama)
    const materi = await Materi.find({ kelasId }).sort({ createdAt: -1 });
    res.json({ success: true, data: materi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/guru/materi
router.post("/materi", upload.single("file"), async (req, res) => {
  try {
    const { judul, deskripsi, kelasId, tipe, url, pertemuan, mapel, kelas: kelasNama } = req.body;

    // ✅ FIX: validasi benar, tidak return variabel yang belum ada
    if (!judul || !kelasId) {
      return res.status(400).json({ success: false, message: "judul dan kelasId wajib diisi." });
    }

    // cek kelas milik guru
    const kelas = await Kelas.findOne({ _id: kelasId, guru: req.user._id });
    if (!kelas) {
      return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });
    }

    // ✅ FIX: tentukan url — dari file upload atau dari field url (untuk tipe link)
    let fileUrl = url || "";
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // ✅ FIX: isi semua field required di schema
    const materiBaru = await Materi.create({
      judul,
      deskripsi: deskripsi || "",
      tipe: tipe || "doc",
      url: fileUrl,
      pertemuan: Number(pertemuan) || 1,
      mapel: mapel || kelas.mapel,
      kelas: kelasNama || kelas.nama,   // String nama kelas, misal "10 A"
      kelasId,                           // ObjectId ref ke Kelas
      guru: req.user._id,                // ✅ dari token, bukan dari frontend
      namaGuru: req.user.nama || "",
    });

    res.status(201).json({
      success: true,
      message: "Materi berhasil disimpan",
      data: materiBaru,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/guru/materi/:id
router.put("/materi/:id", upload.single("file"), async (req, res) => {
  try {
    const materi = await Materi.findOne({ _id: req.params.id, guru: req.user._id });
    if (!materi) {
      return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
    }

    const { judul, deskripsi, tipe, url, pertemuan } = req.body;

    if (judul !== undefined) materi.judul = judul;
    if (deskripsi !== undefined) materi.deskripsi = deskripsi;
    if (tipe !== undefined) materi.tipe = tipe;
    if (pertemuan !== undefined) materi.pertemuan = Number(pertemuan);
    // ✅ FIX: update url — dari file baru atau dari field url
    if (req.file) {
      materi.url = `/uploads/${req.file.filename}`;
    } else if (url !== undefined) {
      materi.url = url;
    }

    await materi.save();
    res.json({ success: true, message: "Materi berhasil diperbarui", data: materi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/guru/materi/:id
router.delete("/materi/:id", async (req, res) => {
  try {
    const materi = await Materi.findOneAndDelete({ _id: req.params.id, guru: req.user._id });
    if (!materi) {
      return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
    }
    res.json({ success: true, message: "Materi berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Pengumuman ───────────────────────────────────────────────────────────────
router.get("/pengumuman", async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const filter = { target: { $in: ["semua", "guru"] } };

    const [list, total] = await Promise.all([
      Pengumuman.find(filter)
        .sort({ penting: -1, createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      Pengumuman.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        total,
        page: Number(page),
        limit: Number(limit),
        list: list.map((p) => ({
          id: p._id,
          judul: p.judul,
          isi: p.isi,
          penulis: p.penulis,
          penulisId: p.penulisId,
          tag: p.tag,
          target: p.target,
          penting: p.penting,
          tanggal: p.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/pengumuman/:id", async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findOne({
      _id: req.params.id,
      target: { $in: ["semua", "guru"] },
    });
    if (!pengumuman)
      return res.status(404).json({ success: false, message: "Pengumuman tidak ditemukan." });

    res.json({
      success: true,
      data: {
        id: pengumuman._id,
        judul: pengumuman.judul,
        isi: pengumuman.isi,
        penulis: pengumuman.penulis,
        tag: pengumuman.tag,
        target: pengumuman.target,
        penting: pengumuman.penting,
        tanggal: pengumuman.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/pengumuman", async (req, res) => {
  try {
    const { judul, isi, tag, target, penting } = req.body;
    if (!judul || !isi) {
      return res.status(400).json({ success: false, message: "Judul dan isi wajib diisi." });
    }

    const allowedTargets = ["semua", "siswa", "guru"];
    const targetValue = allowedTargets.includes(target) ? target : "semua";

    const pengumuman = await Pengumuman.create({
      judul, isi,
      tag: tag || "Umum",
      target: targetValue,
      penting: penting === true,
      penulis: req.user.nama || req.user.name || req.user.email,
      penulisId: req.user._id,
      rolePenulis: "guru",
    });

    res.status(201).json({
      success: true,
      message: "Pengumuman berhasil dibuat.",
      data: {
        id: pengumuman._id,
        judul: pengumuman.judul,
        isi: pengumuman.isi,
        penulis: pengumuman.penulis,
        tag: pengumuman.tag,
        target: pengumuman.target,
        penting: pengumuman.penting,
        tanggal: pengumuman.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/pengumuman/:id", async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findOne({
      _id: req.params.id,
      penulisId: req.user._id,
      rolePenulis: "guru",
    });
    if (!pengumuman) {
      return res.status(404).json({ success: false, message: "Pengumuman tidak ditemukan atau bukan milik Anda." });
    }

    const { judul, isi, tag, target, penting } = req.body;
    const allowedTargets = ["semua", "siswa", "guru"];

    if (judul !== undefined) pengumuman.judul = judul;
    if (isi !== undefined) pengumuman.isi = isi;
    if (tag !== undefined) pengumuman.tag = tag;
    if (target !== undefined && allowedTargets.includes(target)) pengumuman.target = target;
    if (penting !== undefined) pengumuman.penting = penting === true;

    await pengumuman.save();
    res.json({
      success: true,
      message: "Pengumuman berhasil diperbarui.",
      data: {
        id: pengumuman._id,
        judul: pengumuman.judul,
        isi: pengumuman.isi,
        penulis: pengumuman.penulis,
        tag: pengumuman.tag,
        target: pengumuman.target,
        penting: pengumuman.penting,
        tanggal: pengumuman.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/pengumuman/:id", async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findOneAndDelete({
      _id: req.params.id,
      penulisId: req.user._id,
      rolePenulis: "guru",
    });
    if (!pengumuman) {
      return res.status(404).json({ success: false, message: "Pengumuman tidak ditemukan atau bukan milik Anda." });
    }
    res.json({ success: true, message: "Pengumuman berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;