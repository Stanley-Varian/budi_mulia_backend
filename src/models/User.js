import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama wajib diisi"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username wajib diisi"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password wajib diisi"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["siswa", "guru", "admin"],
      required: true,
    },

    // ── Data Siswa ──
    nisn: { type: String, default: null },
    kelas: { type: String, default: null },

    // ── Data Guru ──
    nip: { type: String, default: null },
    mapel: { type: String, default: null },

    // ── Email (wajib untuk reset password) ──
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    // ── OTP Reset Password ──
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password sebelum disimpan
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method cek password
UserSchema.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;