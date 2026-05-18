import mongoose from "mongoose";

// Slot per jam pelajaran
const SlotSchema = new mongoose.Schema(
  {
    mapel: { type: String, required: true },
    guru:  { type: String, required: true },
  },
  { _id: false }
);

// Satu hari = object { 1: slot, 2: slot, ... 11: slot }
const HariSchema = new mongoose.Schema(
  {
    1:  { type: SlotSchema, default: null },
    2:  { type: SlotSchema, default: null },
    3:  { type: SlotSchema, default: null },
    4:  { type: SlotSchema, default: null },
    5:  { type: SlotSchema, default: null },
    6:  { type: SlotSchema, default: null },
    7:  { type: SlotSchema, default: null },
    8:  { type: SlotSchema, default: null },
    9:  { type: SlotSchema, default: null },
    10: { type: SlotSchema, default: null },
    11: { type: SlotSchema, default: null },
  },
  { _id: false }
);

const JadwalSchema = new mongoose.Schema(
  {
    kelas: {
      type: String, // misal "10 B"
      required: true,
    },
    tahunAjaran: {
      type: String, // misal "2024/2025"
      required: true,
    },
    durasi: {
      type: Number, // durasi 1 jam pelajaran dalam menit, misal 45
      default: 45,
    },
    jadwal: {
      Senin:  { type: HariSchema, default: {} },
      Selasa: { type: HariSchema, default: {} },
      Rabu:   { type: HariSchema, default: {} },
      Kamis:  { type: HariSchema, default: {} },
      Jumat:  { type: HariSchema, default: {} },
    },
  },
  { timestamps: true }
);

// Index supaya query by kelas + tahunAjaran cepat
JadwalSchema.index({ kelas: 1, tahunAjaran: 1 }, { unique: true });

const Jadwal = mongoose.model("Jadwal", JadwalSchema);
export default Jadwal;