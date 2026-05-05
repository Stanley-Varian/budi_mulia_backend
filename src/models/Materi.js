import mongoose from "mongoose";

const materiSchema = new mongoose.Schema(
  {
    mapelId: String,
    judul: String,
    deskripsi: String,
    tipe: String,
    pertemuan: Number,
    tanggal: String,
  },
  { timestamps: true }
);

export default mongoose.model("materi", materiSchema);