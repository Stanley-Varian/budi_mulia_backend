import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Helper buat generate token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi.",
      });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah.",
      });
    }

    res.json({
      success: true,
      data: {
        _id:      user._id,
        nama:     user.nama,
        username: user.username,
        role:     user.role,
        kelas:    user.kelas,
        mapel:    user.mapel,
        token:    generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
// Stub — implementasi lengkap oleh orang 1
router.post("/forgot-password", async (req, res) => {
  res.json({
    success: true,
    message: "Permintaan reset password diterima. Hubungi admin sekolah.",
  });
});

export default router;