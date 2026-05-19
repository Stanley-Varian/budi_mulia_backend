import mongoose from "mongoose";

// Model Kelas — dibuat oleh guru, siswa bisa join pakai kodeKelas
const KelasSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama kelas wajib diisi"],
      trim: true,
    },
    mapel: {
      type: String,
      required: [true, "Mata pelajaran wajib diisi"],
      trim: true,
    },
    kodeKelas: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    namaGuru: {
      type: String, // disimpan langsung biar ga perlu populate tiap query
    },
    // Daftar siswa yang sudah bergabung
    anggota: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index supaya lookup by kodeKelas cepat
KelasSchema.index({ kodeKelas: 1 });

const Kelas = mongoose.model("Kelas", KelasSchema);
export default Kelas;