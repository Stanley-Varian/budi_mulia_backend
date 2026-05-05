import express from "express";
import Pengumuman from "../models/Pengumuman.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { tag } = req.query;

    const query = tag ? { tag } : {};

    const data = await Pengumuman.find(query).sort({ createdAt: -1 });

    res.json({
      total: data.length,
      pengumuman: data,
    });
  } catch (err) {
    res.status(500).json({
      message: "Gagal ambil pengumuman",
      error: err.message,
    });
  }
});

export default router;