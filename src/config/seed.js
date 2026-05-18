import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Jadwal from "../models/Jadwal.js";
import Materi from "../models/Materi.js";
import Pengumuman from "../models/Pengumuman.js";
import Ekskul from "../models/Ekskul.js";

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");
};

// ── SEED DATA ────────────────────────────────────────────────────────────────

const seedUsers = async () => {
  await User.deleteMany({});
  console.log("🗑️  Users cleared");

  const salt = await bcrypt.genSalt(10);

  const users = await User.insertMany([
    // Admin
    {
      nama: "Administrator",
      username: "admin",
      password: await bcrypt.hash("sekolah123", salt),
      role: "admin",
    },
    // Guru
    {
      nama: "Bpk. Andi Saputra",
      username: "andi.saputra",
      password: await bcrypt.hash("sekolah123", salt),
      role: "guru",
      nip: "198501012010011001",
      mapel: "Matematika",
    },
    {
      nama: "Ibu Sari Dewi",
      username: "sari.dewi",
      password: await bcrypt.hash("sekolah123", salt),
      role: "guru",
      nip: "198602022011012001",
      mapel: "Bahasa Indonesia",
    },
    // Siswa
    {
      nama: "Stanley Varian Rasa",
      username: "stanley.varian",
      password: await bcrypt.hash("sekolah123", salt),
      role: "siswa",
      nisn: "0012345678",
      kelas: "10 B",
    },
    {
      nama: "Rina Anggraini",
      username: "rina.anggraini",
      password: await bcrypt.hash("sekolah123", salt),
      role: "siswa",
      nisn: "0012345679",
      kelas: "10 A",
    },
  ]);

  console.log(`✅ ${users.length} users seeded`);
  return users;
};

const seedJadwal = async () => {
  await Jadwal.deleteMany({});
  console.log("🗑️  Jadwal cleared");

  const jadwalData = await Jadwal.insertMany([
    {
      kelas: "10 B",
      tahunAjaran: "2024/2025",
      durasi: 45,
      jadwal: {
        Senin: {
          1: null,
          2: { mapel: "Matematika",       guru: "Bpk. Andi Saputra"  },
          3: { mapel: "Matematika",       guru: "Bpk. Andi Saputra"  },
          4: { mapel: "Bahasa Indonesia", guru: "Ibu Sari Dewi"       },
          5: { mapel: "Bahasa Indonesia", guru: "Ibu Sari Dewi"       },
          6: { mapel: "PJOK",             guru: "Bpk. Reza"           },
          7: { mapel: "PJOK",             guru: "Bpk. Reza"           },
          8: { mapel: "PJOK",             guru: "Bpk. Reza"           },
          9: { mapel: "Sejarah",          guru: "Ibu Kartini"         },
          10:{ mapel: "Sejarah",          guru: "Ibu Kartini"         },
          11: null,
        },
        Selasa: {
          1: null,
          2: { mapel: "Kimia",            guru: "Ibu Wulandari"       },
          3: { mapel: "Kimia",            guru: "Ibu Wulandari"       },
          4: { mapel: "Biologi",          guru: "Bpk. Hendra"         },
          5: { mapel: "Biologi",          guru: "Bpk. Hendra"         },
          6: { mapel: "Sejarah",          guru: "Ibu Kartini"         },
          7: { mapel: "Sejarah",          guru: "Ibu Kartini"         },
          8: { mapel: "BK",               guru: "Ibu Ratna"           },
          9: null,
          10: null,
          11: null,
        },
        Rabu: {
          1: null,
          2: { mapel: "Bahasa Inggris",   guru: "Ibu Rina Marlina"    },
          3: { mapel: "Bahasa Inggris",   guru: "Ibu Rina Marlina"    },
          4: { mapel: "Fisika",           guru: "Bpk. Dedi Kurniawan" },
          5: { mapel: "Fisika",           guru: "Bpk. Dedi Kurniawan" },
          6: { mapel: "PKN",              guru: "Bpk. Hadi"           },
          7: { mapel: "PKN",              guru: "Bpk. Hadi"           },
          8: { mapel: "Matematika",       guru: "Bpk. Andi Saputra"   },
          9: { mapel: "Matematika",       guru: "Bpk. Andi Saputra"   },
          10: null,
          11: null,
        },
        Kamis: {
          1: null,
          2: { mapel: "Agama",            guru: "Bpk. Fauzi"          },
          3: { mapel: "Agama",            guru: "Bpk. Fauzi"          },
          4: { mapel: "Kimia",            guru: "Ibu Wulandari"       },
          5: { mapel: "Kimia",            guru: "Ibu Wulandari"       },
          6: { mapel: "Bahasa Indonesia", guru: "Ibu Sari Dewi"       },
          7: { mapel: "Bahasa Indonesia", guru: "Ibu Sari Dewi"       },
          8: { mapel: "Ekonomi",          guru: "Bpk. Budi"           },
          9: { mapel: "Ekonomi",          guru: "Bpk. Budi"           },
          10: null,
          11: null,
        },
        Jumat: {
          1: null,
          2: { mapel: "Bahasa Inggris",   guru: "Ibu Rina Marlina"    },
          3: { mapel: "Bahasa Inggris",   guru: "Ibu Rina Marlina"    },
          4: { mapel: "Agama",            guru: "Bpk. Fauzi"          },
          5: { mapel: "Agama",            guru: "Bpk. Fauzi"          },
          6: { mapel: "Fisika",           guru: "Bpk. Dedi Kurniawan" },
          7: { mapel: "Fisika",           guru: "Bpk. Dedi Kurniawan" },
          8: { mapel: "Bahasa Indonesia", guru: "Ibu Sari Dewi"       },
          9: null,
          10: null,
          11: null,
        },
      },
    },
    {
      kelas: "10 A",
      tahunAjaran: "2024/2025",
      durasi: 45,
      jadwal: {
        Senin: {
          1: null,
          2: { mapel: "Bahasa Indonesia", guru: "Ibu Sari Dewi"       },
          3: { mapel: "Bahasa Indonesia", guru: "Ibu Sari Dewi"       },
          4: { mapel: "Matematika",       guru: "Bpk. Andi Saputra"   },
          5: { mapel: "Matematika",       guru: "Bpk. Andi Saputra"   },
          6: { mapel: "Fisika",           guru: "Bpk. Dedi Kurniawan" },
          7: { mapel: "Fisika",           guru: "Bpk. Dedi Kurniawan" },
          8: { mapel: "Kimia",            guru: "Ibu Wulandari"       },
          9: { mapel: "Kimia",            guru: "Ibu Wulandari"       },
          10: null,
          11: null,
        },
        Selasa:  { 1:null,2:null,3:null,4:null,5:null,6:null,7:null,8:null,9:null,10:null,11:null },
        Rabu:    { 1:null,2:null,3:null,4:null,5:null,6:null,7:null,8:null,9:null,10:null,11:null },
        Kamis:   { 1:null,2:null,3:null,4:null,5:null,6:null,7:null,8:null,9:null,10:null,11:null },
        Jumat:   { 1:null,2:null,3:null,4:null,5:null,6:null,7:null,8:null,9:null,10:null,11:null },
      },
    },
  ]);

  console.log(`✅ ${jadwalData.length} jadwal seeded`);
};

const seedMateri = async (guruId) => {
  await Materi.deleteMany({});
  console.log("🗑️  Materi cleared");

  const materiData = await Materi.insertMany([
    {
      judul: "Pengantar Sistem Persamaan Linear",
      deskripsi: "Materi pembuka tentang konsep dasar SPLDV dan SPLTV",
      tipe: "pdf",
      url: "https://example.com/materi/spldv.pdf",
      ukuran: "2.4 MB",
      pertemuan: 1,
      mapel: "Matematika",
      kelas: "10 B",
      guru: guruId,
      namaGuru: "Bpk. Andi Saputra",
    },
    {
      judul: "Video Penjelasan SPLDV",
      deskripsi: "Metode substitusi dan eliminasi",
      tipe: "video",
      url: "https://example.com/materi/spldv-video.mp4",
      ukuran: "45 menit",
      pertemuan: 1,
      mapel: "Matematika",
      kelas: "10 B",
      guru: guruId,
      namaGuru: "Bpk. Andi Saputra",
    },
    {
      judul: "Latihan Soal Bab 3",
      deskripsi: "Kumpulan soal latihan pertemuan ke-2",
      tipe: "doc",
      url: "https://example.com/materi/latihan-bab3.docx",
      ukuran: "1.1 MB",
      pertemuan: 2,
      mapel: "Matematika",
      kelas: "10 B",
      guru: guruId,
      namaGuru: "Bpk. Andi Saputra",
    },
    {
      judul: "Teks Eksposisi - Pengertian dan Struktur",
      deskripsi: "Materi lengkap tentang teks eksposisi beserta contohnya",
      tipe: "pdf",
      url: "https://example.com/materi/teks-eksposisi.pdf",
      ukuran: "3.1 MB",
      pertemuan: 1,
      mapel: "Bahasa Indonesia",
      kelas: "10 B",
      guru: guruId,
      namaGuru: "Ibu Sari Dewi",
    },
  ]);

  console.log(`✅ ${materiData.length} materi seeded`);
};

const seedPengumuman = async (adminId) => {
  await Pengumuman.deleteMany({});
  console.log("🗑️  Pengumuman cleared");

  const pengumumanData = await Pengumuman.insertMany([
    {
      judul: "Libur Nasional Hari Buruh",
      isi: "Diberitahukan kepada seluruh siswa bahwa pada tanggal 1 Mei 2025 sekolah diliburkan dalam rangka peringatan Hari Buruh Nasional.",
      penulis: "Administrator",
      penulisId: adminId,
      rolePenulis: "admin",
      tag: "Umum",
      target: "semua",
      penting: true,
    },
    {
      judul: "Jadwal Remedial Ujian Tengah Semester",
      isi: "Siswa yang belum mencapai KKM wajib mengikuti remedial tanggal 12-14 Mei 2025.",
      penulis: "Administrator",
      penulisId: adminId,
      rolePenulis: "admin",
      tag: "Akademik",
      target: "siswa",
      penting: true,
    },
    {
      judul: "Ulangan Harian Matematika Kelas 10",
      isi: "Ulangan harian Matematika untuk kelas 10 A dan 10 B akan dilaksanakan pada hari Rabu, 7 Mei 2025.",
      penulis: "Bpk. Andi Saputra",
      penulisId: adminId,
      rolePenulis: "guru",
      tag: "Matematika",
      target: "siswa",
      penting: false,
    },
  ]);

  console.log(`✅ ${pengumumanData.length} pengumuman seeded`);
};

const seedEkskul = async () => {
  await Ekskul.deleteMany({});
  console.log("🗑️  Ekskul cleared");

  const ekskulData = await Ekskul.insertMany([
    { nama:"Paskibra",     pembina:"Bpk. Doni",  hari:"Senin",  jam:"15.00 – 17.00", tempat:"Lapangan Upacara", warna:"#dbeafe", warnaText:"#1e40af" },
    { nama:"Basket",       pembina:"Bpk. Reza",  hari:"Selasa", jam:"15.00 – 17.00", tempat:"Lapangan Basket",  warna:"#dcfce7", warnaText:"#166534" },
    { nama:"PMR",          pembina:"Ibu Ratna",  hari:"Rabu",   jam:"14.30 – 16.30", tempat:"Ruang PMR",        warna:"#fce7f3", warnaText:"#9d174d" },
    { nama:"Rohis",        pembina:"Bpk. Fauzi", hari:"Kamis",  jam:"14.00 – 15.30", tempat:"Mushola",          warna:"#fff7ed", warnaText:"#9a3412" },
    { nama:"English Club", pembina:"Ibu Rina",   hari:"Jumat",  jam:"14.30 – 16.00", tempat:"Ruang 12",         warna:"#d1fae5", warnaText:"#065f46" },
    { nama:"KIR",          pembina:"Ibu Wulan",  hari:"Jumat",  jam:"14.30 – 16.30", tempat:"Lab IPA",          warna:"#ede9fe", warnaText:"#6d28d9" },
  ]);

  console.log(`✅ ${ekskulData.length} ekskul seeded`);
};

// ── RUN SEED ─────────────────────────────────────────────────────────────────
const runSeed = async () => {
  try {
    await connectDB();

    const users      = await seedUsers();
    const adminUser  = users.find(u => u.role === "admin");
    const guruUser   = users.find(u => u.username === "andi.saputra");

    await seedJadwal();
    await seedMateri(guruUser._id);
    await seedPengumuman(adminUser._id);
    await seedEkskul();

    console.log("\n🎉 Semua data berhasil di-seed!");
    console.log("\n📋 Akun untuk testing:");
    console.log("   Admin  → username: admin          | password: sekolah123");
    console.log("   Guru   → username: andi.saputra   | password: sekolah123");
    console.log("   Siswa  → username: stanley.varian | password: sekolah123 | kelas: 10 B");
    console.log("   Siswa  → username: rina.anggraini | password: sekolah123 | kelas: 10 A");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

runSeed();