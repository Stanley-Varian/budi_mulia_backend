import express from "express";
import upload from "../middleware/upload.js";
import Materi from "../models/Materi.js";

const router = express.Router();

// CREATE (upload materi)
router.post("/", upload.single("file"), async (req, res) => {
  const { judul, deskripsi, mapelId } = req.body;

  const data = await Materi.create({
    judul,
    deskripsi,
    mapelId,
    fileUrl: `/uploads/${req.file.filename}`,
  });

  res.json(data);
});

// READ (ambil dari MongoDB)
router.get("/", async (req, res) => {
  try {
    const { mapelId } = req.query;

    const query = mapelId ? { mapelId } : {};

    const data = await Materi.find(query);

    res.json({
      mapel: "Data dari MongoDB",
      list: data,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetch materi", error: err.message });
  }
});

export default router;