import mongoose from "mongoose";

const MateriSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: [true, "Judul materi wajib diisi"],
      trim: true,
    },
    deskripsi: {
      type: String,
      default: "",
    },
    tipe: {
      type: String,
      enum: ["pdf", "video", "doc", "link"],
      required: true,
    },
    // URL file (dari storage) atau URL link eksternal
    url: {
      type: String,
      required: true,
    },
    ukuran: {
      type: String, // misal "2.4 MB" atau "45 menit" untuk video
      default: null,
    },
    pertemuan: {
      type: Number, // pertemuan ke-berapa
      required: true,
    },
    mapel: {
      type: String, // misal "Matematika"
      required: true,
    },
    kelas: {
      type: String, // misal "10 B"
      required: true,
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    namaGuru: {
      type: String, // disimpan langsung biar ga perlu populate terus
    },
  },
  { timestamps: true },
);

// Index supaya query by mapel + kelas cepat
MateriSchema.index({ mapel: 1, kelas: 1 });

const Materi = mongoose.model("Materi", MateriSchema);
export default Materi;
