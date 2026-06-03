import Pengumuman from "../models/Pengumuman.js";
import Kelas from "../models/Kelas.js";

/* ==============================
   PROFIL GURU
============================== */
export const getProfilGuru = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==============================
   JADWAL (placeholder)
============================== */
export const getJadwalGuru = async (req, res) => {
  res.json({
    success: true,
    message: "TODO: implementasi jadwal guru",
  });
};

/* ==============================
   KELAS
============================== */
export const getKelasGuru = async (req, res) => {
  try {
    const kelas = await Kelas.find({ guru: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: kelas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDetailKelasGuru = async (req, res) => {
  try {
    const kelas = await Kelas.findOne({
      _id: req.params.id,
      guru: req.user._id,
    });

    if (!kelas) {
      return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });
    }

    res.json({ success: true, data: kelas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createKelas = async (req, res) => {
  try {
    const { nama, mapel, kodeKelas } = req.body;

    if (!nama || !mapel || !kodeKelas) {
      return res.status(400).json({
        success: false,
        message: "nama, mapel, dan kodeKelas wajib diisi",
      });
    }

    const cek = await Kelas.findOne({ kodeKelas: kodeKelas.toUpperCase() });
    if (cek) {
      return res.status(400).json({
        success: false,
        message: "Kode kelas sudah digunakan",
      });
    }

    const kelas = await Kelas.create({
      nama,
      mapel,
      kodeKelas: kodeKelas.toUpperCase(),
      guru: req.user._id,
      namaGuru: req.user.nama,
      anggota: [],
    });

    res.status(201).json({
      success: true,
      message: "Kelas berhasil dibuat",
      data: kelas,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findOne({
      _id: req.params.id,
      guru: req.user._id,
    });

    if (!kelas) {
      return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });
    }

    const { nama, mapel } = req.body;
    if (nama !== undefined) kelas.nama = nama;
    if (mapel !== undefined) kelas.mapel = mapel;

    await kelas.save();

    res.json({
      success: true,
      message: "Kelas berhasil diperbarui",
      data: kelas,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findOneAndDelete({
      _id: req.params.id,
      guru: req.user._id,
    });

    if (!kelas) {
      return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });
    }

    res.json({
      success: true,
      message: "Kelas berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSiswaKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findOne({
      _id: req.params.id,
      guru: req.user._id,
    }).populate("anggota", "-password");

    if (!kelas) {
      return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });
    }

    res.json({ success: true, data: kelas.anggota });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==============================
   PENGUMUMAN
============================== */
export const getPengumumanGuru = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

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
        list,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDetailPengumumanGuru = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findOne({
      _id: req.params.id,
      target: { $in: ["semua", "guru"] },
    });

    if (!pengumuman) {
      return res.status(404).json({ success: false, message: "Pengumuman tidak ditemukan" });
    }

    res.json({ success: true, data: pengumuman });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPengumumanGuru = async (req, res) => {
  try {
    const { judul, isi, tag, target, penting } = req.body;

    if (!judul || !isi) {
      return res.status(400).json({
        success: false,
        message: "Judul dan isi wajib diisi",
      });
    }

    const pengumuman = await Pengumuman.create({
      judul,
      isi,
      tag: tag || "Umum",
      target: target || "semua",
      penting: penting === true,
      penulis: req.user.nama,
      penulisId: req.user._id,
      rolePenulis: "guru",
    });

    res.status(201).json({
      success: true,
      message: "Pengumuman berhasil dibuat",
      data: pengumuman,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePengumumanGuru = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findOne({
      _id: req.params.id,
      penulisId: req.user._id,
      rolePenulis: "guru",
    });

    if (!pengumuman) {
      return res.status(404).json({
        success: false,
        message: "Pengumuman tidak ditemukan atau bukan milik Anda",
      });
    }

    Object.assign(pengumuman, req.body);
    await pengumuman.save();

    res.json({
      success: true,
      message: "Pengumuman berhasil diperbarui",
      data: pengumuman,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePengumumanGuru = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findOneAndDelete({
      _id: req.params.id,
      penulisId: req.user._id,
      rolePenulis: "guru",
    });

    if (!pengumuman) {
      return res.status(404).json({
        success: false,
        message: "Pengumuman tidak ditemukan atau bukan milik Anda",
      });
    }

    res.json({
      success: true,
      message: "Pengumuman berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};