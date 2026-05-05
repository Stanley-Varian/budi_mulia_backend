import mongoose from "mongoose";

const jadwalSchema = new mongoose.Schema(
  {
    kelasId: String,
    hari: String,
    mapel: String,
    jam: String,
    guru: String,
  },
  { timestamps: true }
);

export default mongoose.model("Jadwal", jadwalSchema);