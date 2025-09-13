import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import Job from "../../lib/models/job.model.js";
import User from "../../lib/models/user.model.js";
import { sendEmail } from "../../lib/email.js";

const router = Router();

// Crear un nuevo trabajo
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Solo empleadores pueden crear trabajos" });
    }

    const { title, descriptionMarkdown, date, durationHours, maxApplicants } = req.body;

    if (!title || !descriptionMarkdown || !date || !durationHours) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const newJob = new Job({
      title,
      descriptionMarkdown,
      employer: req.user.id,
      date,
      durationHours,
      maxApplicants,
    });

    await newJob.save();

    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error al publicar trabajo:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Listar todos los trabajos
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("employer", "name email role");
    res.json(jobs);
  } catch (err) {
    console.error("Error al obtener trabajos:", err);
    res.status(500).json({ error: "Error al obtener trabajos" });
  }
});

// Inscribirse a oferta
router.post("/:id/apply", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ error: "Solo los empleados pueden postularse" });
    }

    const job = await Job.findById(req.params.id).populate("employer");

    if (!job) {
      return res.status(404).json({ error: "Trabajo no encontrado" });
    }

    if (job.applicants.includes(req.user.id)) {
      return res.status(400).json({ error: "Ya estás inscrito a este trabajo" });
    }

    if (job.applicants.length >= job.maxApplicants) {
      return res.status(400).json({ error: "El trabajo ya alcanzó el máximo de candidatos" });
    }

    job.applicants.push(req.user.id);
    await job.save();

    // Mensaje a empresario
    try {
      await sendEmail({
        to: job.employer.email,
        subject: `Nueva persona inscrita en tu oferta trabajo: ${job.title}`,
        html: `
          <h1>Nuevo Candidato a la oferta: ${job.title}</h1>
          <p>El usuario <b>${req.user.id}</b> se ha inscrito a la oferta <b>${job.title}</b>.</p>
          <p>Fecha: ${job.date}</p>
        `,
      });
      console.log("Email enviado al empresario:", job.employer.email);
    } catch (emailErr) {
      console.error("Error enviando correo al empresario:", emailErr);
    }

    res.json({ message: "Postulación exitosa", job });
  } catch (err) {
    console.error("Error en postulación:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
