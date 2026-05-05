import express from "express";
import Ekskul from "../models/Ekskul.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Ekskul.find();

  res.json({
    total: data.length,
    list: data,
  });
});

export default router;