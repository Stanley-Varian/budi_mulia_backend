import express from "express";
import Jadwal from "../models/Jadwal.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { kelasId } = req.query;

    const query = kelasId ? { kelasId } : {};

    const data = await Jadwal.find(query);

    res.json({
      kelasId: kelasId || null,
      jadwal: data,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetch jadwal",
      error: err.message,
    });
  }
});

export default router;