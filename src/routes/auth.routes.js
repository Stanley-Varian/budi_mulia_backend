import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

// ── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Helper: nodemailer transporter ───────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true untuk port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// ── Helper: generate 6-digit OTP ─────────────────────────────────────────────
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

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

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
// Step 1: User masukkan email → kirim OTP ke email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email wajib diisi." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Jangan kasih tau email tidak ada (security best practice)
      return res.json({
        success: true,
        message: "Jika email terdaftar, OTP akan dikirim.",
      });
    }

    // Generate OTP dan set expiry 10 menit
    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
    await user.save();

    // Kirim email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SMA Budi Mulia" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Kode OTP Reset Password",
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; background: #2952cc; border-radius: 8px; padding: 14px 18px;">
              <span style="color: white; font-size: 22px; font-weight: 700; letter-spacing: 1px;">SMA Budi Mulia</span>
            </div>
          </div>
          <h2 style="color: #1e293b; text-align: center; font-size: 20px; margin-bottom: 8px;">Reset Password</h2>
          <p style="color: #64748b; text-align: center; font-size: 14px; margin-bottom: 28px;">
            Halo <strong>${user.nama}</strong>, gunakan kode OTP berikut untuk mereset password kamu.
          </p>
          <div style="background: #2952cc; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="color: white; font-size: 40px; font-weight: 700; letter-spacing: 10px;">${otp}</span>
          </div>
          <p style="color: #94a3b8; text-align: center; font-size: 13px;">
            Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini ke siapapun.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #cbd5e1; text-align: center; font-size: 12px;">
            Jika kamu tidak meminta reset password, abaikan email ini.
          </p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "OTP berhasil dikirim ke email kamu.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Gagal mengirim OTP. Coba beberapa saat lagi." });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
// Step 2: Verifikasi OTP yang diinput user
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email dan OTP wajib diisi." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: "OTP tidak valid atau sudah kadaluarsa." });
    }

    // Cek apakah OTP sudah expired
    if (new Date() > user.resetOtpExpiry) {
      // Bersihkan OTP yang expired
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: "OTP sudah kadaluarsa. Minta OTP baru." });
    }

    // Cek apakah OTP cocok
    if (user.resetOtp !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Kode OTP salah." });
    }

    // OTP valid — buat token sementara untuk step berikutnya (reset password)
    // Token ini berlaku 15 menit
    const resetToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Hapus OTP setelah diverifikasi
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: "OTP valid.",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
// Step 3: Reset password menggunakan resetToken dari step 2
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: "Token dan password baru wajib diisi." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password minimal 6 karakter." });
    }

    // Verifikasi resetToken
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: "Token tidak valid atau sudah kadaluarsa." });
    }

    if (decoded.purpose !== "reset-password") {
      return res.status(400).json({ success: false, message: "Token tidak valid." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    // Update password — pre-save hook akan hash otomatis
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password berhasil direset. Silakan login dengan password baru.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;