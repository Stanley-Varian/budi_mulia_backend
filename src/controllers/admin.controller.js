import User from "../models/User.js";
import Jadwal from "../models/Jadwal.js";
import Pengumuman from "../models/Pengumuman.js";

// ══════════════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════════════

export const getStats = async (req, res) => {
  try {
    const [totalSiswa, totalGuru, totalPengumuman, totalJadwal] = await Promise.all([
      User.countDocuments({ role: "siswa" }),
      User.countDocuments({ role: "guru" }),
      Pengumuman.countDocuments(),
      Jadwal.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { totalSiswa, totalGuru, totalPengumuman, totalJadwal },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ══════════════════════════════════════════════════════
//  CRUD USER (siswa & guru)
// ══════════════════════════════════════════════════════

// GET /api/admin/users?role=siswa&page=1&limit=10&search=budi
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const filter = { role: { $in: ["siswa", "guru"] } };
    if (role && ["siswa", "guru"].includes(role)) filter.role = role;
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/users
export const createUser = async (req, res) => {
  try {
    const { nama, username, password, role, nisn, kelas, nip, mapel } = req.body;

    if (!nama || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "nama, username, password, dan role wajib diisi.",
      });
    }
    if (!["siswa", "guru"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role harus siswa atau guru." });
    }

    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Username sudah digunakan." });
    }

    const user = await User.create({ nama, username, password, role, nisn, kelas, nip, mapel });
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ success: true, message: "User berhasil dibuat.", data: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { nama, username, password, role, nisn, kelas, nip, mapel } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Akun admin tidak bisa diubah." });
    }

    // Cek username duplikat kalau diubah
    if (username && username !== user.username) {
      const exists = await User.findOne({ username: username.toLowerCase() });
      if (exists) return res.status(400).json({ success: false, message: "Username sudah digunakan." });
      user.username = username.toLowerCase();
    }

    if (nama) user.nama = nama;
    if (role && ["siswa", "guru"].includes(role)) user.role = role;
    if (password) user.password = password; // akan di-hash oleh pre-save hook
    if (nisn !== undefined) user.nisn = nisn;
    if (kelas !== undefined) user.kelas = kelas;
    if (nip !== undefined) user.nip = nip;
    if (mapel !== undefined) user.mapel = mapel;

    await user.save();
    const { password: _, ...userData } = user.toObject();

    res.json({ success: true, message: "User berhasil diperbarui.", data: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Akun admin tidak bisa dihapus." });
    }

    await user.deleteOne();
    res.json({ success: true, message: "User berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ══════════════════════════════════════════════════════
//  JADWAL
// ══════════════════════════════════════════════════════

// POST /api/admin/jadwal/save  — simpan/timpa jadwal hasil generate
export const saveJadwal = async (req, res) => {
  try {
    const { kelas, tahunAjaran, durasi, jadwal } = req.body;

    if (!kelas || !tahunAjaran || !jadwal) {
      return res.status(400).json({
        success: false,
        message: "kelas, tahunAjaran, dan jadwal wajib diisi.",
      });
    }

    // upsert: kalau sudah ada timpa, kalau belum buat baru
    const result = await Jadwal.findOneAndUpdate(
      { kelas, tahunAjaran },
      { kelas, tahunAjaran, durasi: durasi || 45, jadwal },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Jadwal kelas ${kelas} (${tahunAjaran}) berhasil disimpan.`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/jadwal?kelas=10B&tahunAjaran=2024/2025
export const getJadwal = async (req, res) => {
  try {
    const { kelas, tahunAjaran } = req.query;
    const filter = {};
    if (kelas) filter.kelas = kelas;
    if (tahunAjaran) filter.tahunAjaran = tahunAjaran;

    const data = await Jadwal.find(filter).sort({ kelas: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ══════════════════════════════════════════════════════
//  PENGUMUMAN
// ══════════════════════════════════════════════════════

// GET /api/admin/pengumuman?target=semua&page=1
export const getPengumuman = async (req, res) => {
  try {
    const { target, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (target) filter.target = target;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Pengumuman.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Pengumuman.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/pengumuman
export const createPengumuman = async (req, res) => {
  try {
    const { judul, isi, tag, target, penting } = req.body;

    if (!judul || !isi) {
      return res.status(400).json({ success: false, message: "judul dan isi wajib diisi." });
    }

    const pengumuman = await Pengumuman.create({
      judul,
      isi,
      tag: tag || "Umum",
      target: target || "semua",
      penting: penting || false,
      penulis: req.user.nama,
      penulisId: req.user._id,
      rolePenulis: req.user.role,
    });

    res.status(201).json({
      success: true,
      message: "Pengumuman berhasil dibuat.",
      data: pengumuman,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/pengumuman/:id
export const updatePengumuman = async (req, res) => {
  try {
    const { judul, isi, tag, target, penting } = req.body;

    const pengumuman = await Pengumuman.findById(req.params.id);
    if (!pengumuman) {
      return res.status(404).json({ success: false, message: "Pengumuman tidak ditemukan." });
    }

    if (judul !== undefined) pengumuman.judul = judul;
    if (isi !== undefined) pengumuman.isi = isi;
    if (tag !== undefined) pengumuman.tag = tag;
    if (target !== undefined) pengumuman.target = target;
    if (penting !== undefined) pengumuman.penting = penting;

    await pengumuman.save();
    res.json({ success: true, message: "Pengumuman berhasil diperbarui.", data: pengumuman });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/pengumuman/:id
export const deletePengumuman = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findById(req.params.id);
    if (!pengumuman) {
      return res.status(404).json({ success: false, message: "Pengumuman tidak ditemukan." });
    }

    await pengumuman.deleteOne();
    res.json({ success: true, message: "Pengumuman berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
