import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import Job from "../../lib/models/job.model.js";
import User from "../../lib/models/user.model.js";
import { sendEmail } from "../../lib/email.js";

const router = Router();

// Crear nuevo trabajo
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Solo empleadores pueden crear trabajos" });
    }

    const { title, descriptionMarkdown, date, durationHours, maxApplicants } = req.body;

    if (!title || !descriptionMarkdown || !date || !durationHours) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validación: fecha al menos 2 horas en el futuro
    const jobDate = new Date(date);
    const nowPlus2h = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (isNaN(jobDate.getTime()) || jobDate < nowPlus2h) {
      return res.status(400).json({ error: "La fecha debe tener al menos 2 horas de antelación" });
    }

    // Validación: límites razonables
    if (durationHours < 1 || durationHours > 12) {
      return res.status(400).json({ error: "La duración debe estar entre 1 y 12 horas" });
    }
    if (maxApplicants && (maxApplicants < 1 || maxApplicants > 10)) {
      return res.status(400).json({ error: "El máximo de postulantes debe estar entre 1 y 10" });
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


// Mostrar todos los trabajos
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

// Ver candidatos de una oferta de trabajo
router.get("/:id/applicants", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Solo los empleadores pueden ver candidatos" });
    }

    const job = await Job.findById(req.params.id)
      .populate("applicants", "name email age socialSecurityNumber");

    if (!job) {
      return res.status(404).json({ error: "Trabajo no encontrado" });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para ver los candidatos de este trabajo" });
    }

    res.json({ applicants: job.applicants });
  } catch (err) {
    console.error("Error obteniendo candidatos:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Eliminar trabajo
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Solo los empleadores pueden eliminar trabajos" });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Trabajo no encontrado" });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "No puedes eliminar trabajos que no son tuyos" });
    }

    await job.deleteOne();

    res.json({ message: "Trabajo eliminado correctamente" });
  } catch (err) {
    console.error("Error eliminando trabajo:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.patch("/:id/complete", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Solo los empleadores pueden completar trabajos" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Trabajo no encontrado" });

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "No puedes completar trabajos que no son tuyos" });
    }

    if (job.status === "completed") {
      return res.status(400).json({ error: "El trabajo ya estaba completado" });
    }

    job.status = "completed";
    job.completedAt = new Date();
    await job.save();

    res.json({ message: "Trabajo marcado como completado", job });
  } catch (err) {
    console.error("Error completando trabajo:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
