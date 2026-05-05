import mongoose from "mongoose";

const pengumumansSchema = new mongoose.Schema(
  {
    judul: String,
    isi: String,
    penulis: String,
    tanggal: String,
    tag: String,
  },
  { timestamps: true },
);

export default mongoose.model("Pengumuman", pengumumansSchema, "pengumumans");