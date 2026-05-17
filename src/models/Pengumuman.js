import mongoose from "mongoose";

const PengumumanSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: [true, "Judul pengumuman wajib diisi"],
      trim: true,
    },
    isi: {
      type: String,
      required: [true, "Isi pengumuman wajib diisi"],
    },
    penulis: {
      type: String,
      required: true,
    },
    penulisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rolePenulis: {
      type: String,
      enum: ["admin", "guru"],
      required: true,
    },
    tag: {
      type: String,
      default: "Umum",
    },
    // Target penerima pengumuman
    target: {
      type: String,
      enum: ["semua", "siswa", "guru"],
      default: "semua",
    },
    penting: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index supaya query by target cepat
PengumumanSchema.index({ target: 1, createdAt: -1 });

const Pengumuman = mongoose.model("Pengumuman", PengumumanSchema);
export default Pengumuman;