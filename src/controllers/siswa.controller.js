import Jadwal from "../models/Jadwal.js";
import Materi from "../models/Materi.js";
import Pengumuman from "../models/Pengumuman.js";
import Ekskul from "../models/Ekskul.js";

// ── GET /api/siswa/jadwal ────────────────────────────────────────────────────
// Ambil jadwal berdasarkan kelas siswa yang login
// Frontend: jadwal-siswa-page.tsx → JADWAL mock data
export const getJadwal = async (req, res) => {
  try {
    const kelas = req.user.kelas;

    if (!kelas) {
      return res.status(400).json({
        success: false,
        message: "Data kelas siswa tidak ditemukan.",
      });
    }

    // Ambil tahun ajaran aktif (bisa dari query atau default terbaru)
    const tahunAjaran = req.query.tahunAjaran || null;

    const query = { kelas };
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;

    // Kalau ada tahun ajaran spesifik, cari itu. Kalau tidak, ambil yang terbaru
    const jadwal = tahunAjaran
      ? await Jadwal.findOne(query)
      : await Jadwal.findOne({ kelas }).sort({ createdAt: -1 });

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: `Jadwal untuk kelas ${kelas} belum tersedia.`,
      });
    }

    res.json({
      success: true,
      data: {
        kelas:       jadwal.kelas,
        tahunAjaran: jadwal.tahunAjaran,
        durasi:      jadwal.durasi,
        jadwal:      jadwal.jadwal,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/materi ────────────────────────────────────────────────────
// Ambil semua mapel yang tersedia untuk kelas siswa
// Frontend: dashboard-siswa-page.tsx → MAPEL grid cards
export const getMapelList = async (req, res) => {
  try {
    const kelas = req.user.kelas;

    // Ambil daftar mapel unik yang punya materi untuk kelas ini
    const mapelList = await Materi.aggregate([
      { $match: { kelas } },
      {
        $group: {
          _id:       "$mapel",
          namaMapel: { $first: "$mapel" },
          namaGuru:  { $first: "$namaGuru" },
          updatedAt: { $max: "$updatedAt" },
          jumlahMateri: { $sum: 1 },
        },
      },
      { $sort: { namaMapel: 1 } },
    ]);

    res.json({
      success: true,
      data: mapelList.map((m) => ({
        mapel:        m.namaMapel,
        guru:         m.namaGuru,
        jumlahMateri: m.jumlahMateri,
        updatedAt:    m.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/materi/:mapel ─────────────────────────────────────────────
// Ambil daftar materi per mata pelajaran untuk kelas siswa
// Frontend: materi-siswa-page.tsx → materiList
export const getMateriByMapel = async (req, res) => {
  try {
    const kelas = req.user.kelas;
    const mapel = decodeURIComponent(req.params.mapel);
    const { pertemuan } = req.query; // optional filter by pertemuan

    const query = { kelas, mapel };
    if (pertemuan) query.pertemuan = Number(pertemuan);

    const materiList = await Materi.find(query).sort({
      pertemuan: 1,
      createdAt: -1,
    });

    if (materiList.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Belum ada materi ${mapel} untuk kelas ${kelas}.`,
      });
    }

    res.json({
      success: true,
      data: {
        mapel,
        kelas,
        guru:  materiList[0].namaGuru,
        list:  materiList.map((m) => ({
          id:         m._id,
          judul:      m.judul,
          deskripsi:  m.deskripsi,
          tipe:       m.tipe,
          url:        m.url,
          ukuran:     m.ukuran,
          pertemuan:  m.pertemuan,
          tanggal:    m.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/pengumuman ────────────────────────────────────────────────
// Ambil pengumuman yang ditujukan ke siswa atau semua
// Frontend: pengumuman-page.tsx → MOCK_DATA
export const getPengumuman = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const pengumumanList = await Pengumuman.find({
      target: { $in: ["semua", "siswa"] },
    })
      .sort({ penting: -1, createdAt: -1 }) // penting dulu, terbaru dulu
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Pengumuman.countDocuments({
      target: { $in: ["semua", "siswa"] },
    });

    res.json({
      success: true,
      data: {
        total,
        page:    Number(page),
        limit:   Number(limit),
        list: pengumumanList.map((p) => ({
          id:          p._id,
          judul:       p.judul,
          isi:         p.isi,
          penulis:     p.penulis,
          tag:         p.tag,
          target:      p.target,
          penting:     p.penting,
          tanggal:     p.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/pengumuman/:id ────────────────────────────────────────────
// Ambil detail 1 pengumuman
// Frontend: pengumuman-page.tsx → modal detail
export const getPengumumanDetail = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findOne({
      _id:    req.params.id,
      target: { $in: ["semua", "siswa"] },
    });

    if (!pengumuman) {
      return res.status(404).json({
        success: false,
        message: "Pengumuman tidak ditemukan.",
      });
    }

    res.json({
      success: true,
      data: {
        id:      pengumuman._id,
        judul:   pengumuman.judul,
        isi:     pengumuman.isi,
        penulis: pengumuman.penulis,
        tag:     pengumuman.tag,
        target:  pengumuman.target,
        penting: pengumuman.penting,
        tanggal: pengumuman.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/ekskul ────────────────────────────────────────────────────
// Ambil semua ekskul aktif
// Frontend: jadwal-siswa-page.tsx → EKSKUL tab
export const getEkskul = async (req, res) => {
  try {
    const ekskulList = await Ekskul.find({ aktif: true }).sort({ hari: 1, jam: 1 });

    res.json({
      success: true,
      data: ekskulList.map((e) => ({
        id:        e._id,
        nama:      e.nama,
        pembina:   e.pembina,
        hari:      e.hari,
        jam:       e.jam,
        tempat:    e.tempat,
        warna:     e.warna,
        warnaText: e.warnaText,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/siswa/profil ────────────────────────────────────────────────────
// Ambil data profil siswa yang login
// Frontend: settings-page.tsx → field profil
export const getProfil = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        nama:        req.user.nama,
        username:    req.user.username,
        nisn:        req.user.nisn,
        kelas:       req.user.kelas,
        role:        req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};