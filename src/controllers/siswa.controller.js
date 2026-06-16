import Jadwal from "../models/Jadwal.js";
import Materi from "../models/Materi.js";
import Pengumuman from "../models/Pengumuman.js";
import Ekskul from "../models/Ekskul.js";
import Kelas from "../models/Kelas.js";

// ── GET /api/siswa/jadwal ────────────────────────────────────────────────────
export const getJadwal = async (req, res) => {
  try {
    const kelas = req.user.kelas;
    if (!kelas) return res.status(400).json({ success: false, message: "Data kelas siswa tidak ditemukan." });

    const tahunAjaran = req.query.tahunAjaran || null;
    const query = { kelas };
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;

    const jadwal = tahunAjaran
      ? await Jadwal.findOne(query)
      : await Jadwal.findOne({ kelas }).sort({ createdAt: -1 });

    if (!jadwal) return res.status(404).json({ success: false, message: `Jadwal untuk kelas ${kelas} belum tersedia.` });

    res.json({ success: true, data: { kelas: jadwal.kelas, tahunAjaran: jadwal.tahunAjaran, durasi: jadwal.durasi, jadwal: jadwal.jadwal } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/materi ────────────────────────────────────────────────────
// Gabungkan mapel dari kelas yang di-join + kelas bawaan profil siswa
export const getMapelList = async (req, res) => {
  try {
    const siswaId = req.user._id;
    const kelasDefault = req.user.kelas;

    // Kelas yang diikuti via kode
    const kelasDiikuti = await Kelas.find({ anggota: siswaId });
    const semuaMapel = new Map();

    for (const k of kelasDiikuti) {
      semuaMapel.set(k.mapel, { mapel: k.mapel, guru: k.namaGuru, updatedAt: k.updatedAt });
    }

    // Mapel dari materi kelas bawaan
    if (kelasDefault) {
      const mapelDariMateri = await Materi.aggregate([
        { $match: { kelas: kelasDefault } },
        { $group: { _id: "$mapel", mapel: { $first: "$mapel" }, guru: { $first: "$namaGuru" }, updatedAt: { $max: "$updatedAt" } } },
        { $sort: { mapel: 1 } },
      ]);
      for (const m of mapelDariMateri) {
        if (!semuaMapel.has(m.mapel)) semuaMapel.set(m.mapel, { mapel: m.mapel, guru: m.guru, updatedAt: m.updatedAt });
      }
    }

    const result = Array.from(semuaMapel.values()).sort((a, b) => a.mapel.localeCompare(b.mapel));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/siswa/kelas/join ───────────────────────────────────────────────
// Body: { kodeKelas: string }
export const joinKelas = async (req, res) => {
  try {
    const { kodeKelas } = req.body;
    const siswaId = req.user._id;

    if (!kodeKelas || !kodeKelas.trim()) {
      return res.status(400).json({ success: false, message: "Kode kelas tidak boleh kosong." });
    }

    const kelas = await Kelas.findOne({ kodeKelas: kodeKelas.trim().toUpperCase() });
    if (!kelas) {
      return res.status(404).json({ success: false, message: "Kode kelas tidak ditemukan. Pastikan kode yang kamu masukkan benar." });
    }

    const sudahGabung = kelas.anggota.some((id) => id.toString() === siswaId.toString());
    if (sudahGabung) {
      return res.status(400).json({ success: false, message: `Kamu sudah terdaftar di kelas ${kelas.nama}.` });
    }

    kelas.anggota.push(siswaId);
    await kelas.save();

    res.json({
      success: true,
      message: `Berhasil bergabung ke kelas ${kelas.nama}!`,
      data: { id: kelas._id, nama: kelas.nama, mapel: kelas.mapel, guru: kelas.namaGuru, kodeKelas: kelas.kodeKelas },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/kelas ─────────────────────────────────────────────────────
export const getKelasSiswa = async (req, res) => {
  try {
    const siswaId = req.user._id;
    const kelasList = await Kelas.find({ anggota: siswaId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: kelasList.map((k) => ({ id: k._id, nama: k.nama, mapel: k.mapel, guru: k.namaGuru, kodeKelas: k.kodeKelas })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/materi/:mapel ─────────────────────────────────────────────
export const getMateriByMapel = async (req, res) => {
  try {
    const kelas = req.user.kelas;
    const mapel = decodeURIComponent(req.params.mapel);
    const { pertemuan } = req.query;

    const query = { kelas, mapel };
    if (pertemuan) query.pertemuan = Number(pertemuan);

    const materiList = await Materi.find(query).sort({ pertemuan: 1, createdAt: -1 });
    if (materiList.length === 0) return res.status(404).json({ success: false, message: `Belum ada materi ${mapel} untuk kelas ${kelas}.` });

    res.json({
      success: true,
      data: {
        mapel, kelas, guru: materiList[0].namaGuru,
        list: materiList.map((m) => ({ id: m._id, judul: m.judul, deskripsi: m.deskripsi, tipe: m.tipe, url: m.url, ukuran: m.ukuran, pertemuan: m.pertemuan, tanggal: m.createdAt })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/pengumuman ────────────────────────────────────────────────
export const getPengumuman = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const pengumumanList = await Pengumuman.find({ target: { $in: ["semua", "siswa"] } })
      .sort({ penting: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await Pengumuman.countDocuments({ target: { $in: ["semua", "siswa"] } });

    res.json({ success: true, data: { total, page: Number(page), limit: Number(limit), list: pengumumanList.map((p) => ({ id: p._id, judul: p.judul, isi: p.isi, penulis: p.penulis, tag: p.tag, target: p.target, penting: p.penting, tanggal: p.createdAt })) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/pengumuman/:id ────────────────────────────────────────────
export const getPengumumanDetail = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findOne({ _id: req.params.id, target: { $in: ["semua", "siswa"] } });
    if (!pengumuman) return res.status(404).json({ success: false, message: "Pengumuman tidak ditemukan." });

    res.json({ success: true, data: { id: pengumuman._id, judul: pengumuman.judul, isi: pengumuman.isi, penulis: pengumuman.penulis, tag: pengumuman.tag, target: pengumuman.target, penting: pengumuman.penting, tanggal: pengumuman.createdAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/ekskul ────────────────────────────────────────────────────
export const getEkskul = async (req, res) => {
  try {
    const ekskulList = await Ekskul.find({ aktif: true }).sort({ hari: 1, jam: 1 });
    res.json({ success: true, data: ekskulList.map((e) => ({ id: e._id, nama: e.nama, pembina: e.pembina, hari: e.hari, jam: e.jam, tempat: e.tempat, warna: e.warna, warnaText: e.warnaText })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/profil ────────────────────────────────────────────────────
export const getProfil = async (req, res) => {
  try {
    res.json({ success: true, data: { nama: req.user.nama, username: req.user.username, nisn: req.user.nisn, kelas: req.user.kelas, role: req.user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const leaveKelas = async (req, res) => {
  try {
    const siswaId = req.user._id;
    const kelasId = req.params.id;

    const kelas = await Kelas.findById(kelasId);

    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: "Kelas tidak ditemukan.",
      });
    }

    kelas.anggota = kelas.anggota.filter(
      (id) => id.toString() !== siswaId.toString()
    );

    await kelas.save();

    res.json({
      success: true,
      message: "Berhasil keluar kelas.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};