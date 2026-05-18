import mongoose from "mongoose";

const EkskulSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama ekskul wajib diisi"],
      trim: true,
    },
    pembina: {
      type: String,
      required: true,
    },
    hari: {
      type: String,
      enum: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
      required: true,
    },
    jam: {
      type: String, // misal "15.00 – 17.00"
      required: true,
    },
    tempat: {
      type: String,
      required: true,
    },
    // Warna chip di frontend
    warna: {
      type: String,
      default: "#dbeafe",
    },
    warnaText: {
      type: String,
      default: "#1e40af",
    },
    aktif: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Ekskul = mongoose.model("Ekskul", EkskulSchema);
export default Ekskul;