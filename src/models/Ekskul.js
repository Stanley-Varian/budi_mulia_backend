import mongoose from "mongoose";

const ekskulSchema = new mongoose.Schema(
  {
    nama: String,
    pembina: String,
    jadwal: String,
    lokasi: String,
  },
  { timestamps: true }
);

export default mongoose.model("Ekskul", ekskulSchema);