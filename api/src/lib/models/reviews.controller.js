import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import Job from "../../lib/models/job.model.js";
import User from "../../lib/models/user.model.js";
import Review from "../../lib/models/review.model.js";

const router = Router();

router.post("/:jobId", authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { rating, comment, reviewedUserId } = req.body;

    if (!rating) return res.status(400).json({ error: "rating es obligatorio" });

    const job = await Job.findById(jobId).populate("employer");
    if (!job) return res.status(404).json({ error: "Trabajo no encontrado" });

    if (job.status !== "completed") {
      return res.status(400).json({ error: "Solo se puede reseñar trabajos completados" });
    }

    let reviewedId;

    if (req.user.role === "worker") {

        reviewedId = job.employer.toString();

        if (!job.applicants.map(String).includes(req.user.id)) {
        return res.status(403).json({ error: "No participaste en este trabajo" });
      }
    } else if (req.user.role === "employer") {

        if (!reviewedUserId) {
        return res.status(400).json({ error: "reviewedUserId es obligatorio para employers" });
      }
      if (job.employer.toString() !== req.user.id) {
        return res.status(403).json({ error: "No puedes reseñar trabajos que no son tuyos" });
      }
      if (!job.applicants.map(String).includes(reviewedUserId)) {
        return res.status(400).json({ error: "El usuario indicado no participó en este trabajo" });
      }
      reviewedId = reviewedUserId;
    } else {
      return res.status(403).json({ error: "Rol no permitido para dejar reviews" });
    }

    // Evitar ponerme valoraciones a uno mismo
    if (reviewedId === req.user.id) {
      return res.status(400).json({ error: "No puedes reseñarte a ti mismo" });
    }

    const review = await Review.create({
      job: job._id,
      reviewer: req.user.id,
      reviewed: reviewedId,
      rating,
      comment: comment || ""
    });

    res.status(201).json(review);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ error: "Ya has dejado una review para este usuario en este trabajo" });
    }
    console.error("Error creando review:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const exists = await User.exists({ _id: userId });
    if (!exists) return res.status(404).json({ error: "Usuario no encontrado" });

    const reviews = await Review.find({ reviewed: userId })
      .populate("reviewer", "name email role")
      .populate("job", "title date");

    res.json({ reviews });
  } catch (err) {
    console.error("Error obteniendo reviews:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
