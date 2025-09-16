import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import Job from "../../lib/models/job.model.js";

const router = Router();

router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ error: "Solo los trabajadores pueden ver sus postulaciones" });
    }

    const jobs = await Job.find({ applicants: req.user.id })
      .populate("employer", "name email")
      .select("title date durationHours employer");

    res.json({ applications: jobs });
  } catch (err) {
    console.error("Error obteniendo postulaciones:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
  
});



export default router;
