// src/api/controllers/sessions.controller.js
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "ok sessions" });
});

export default router;
