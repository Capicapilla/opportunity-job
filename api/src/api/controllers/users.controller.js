import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../../lib/models/user.model.js";
import { authMiddleware } from "../middlewares/auth.js";
import Job from "../../lib/models/job.model.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, age, socialSecurityNumber, email, password, role } = req.body;

    if (!name || !age || !socialSecurityNumber || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      age,
      socialSecurityNumber,
      email,
      passwordHash,
      role,
    });

    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      age: newUser.age,
      socialSecurityNumber: newUser.socialSecurityNumber,
    });
  } catch (err) {
    console.error("Error registrando usuario:", err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `El ${field} ya está registrado` });
    }

    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get("/", (req, res) => {
  res.json({ message: "ok users" });
});
// Obtener el perfil del usuario logueado
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error obteniendo perfil:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Mis postulaciones (trabajador)
router.get("/me/applications", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ error: "Solo los trabajadores pueden ver sus postulaciones" });
    }

    const jobs = await Job.find({
      applicants: req.user.id,
    })
      .select("title date durationHours employer status createdAt")
      .populate("employer", "name email")
      .sort({ date: 1 });

    res.json({ applications: jobs });
  } catch (err) {
    console.error("Error obteniendo postulaciones:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
router.get("/me/history", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "worker") {
      const jobs = await Job.find({
        status: "completed",
        applicants: req.user.id
      })
        .select("title date durationHours employer completedAt")
        .populate("employer", "name email");
      return res.json({ role: "worker", history: jobs });
    }

    if (req.user.role === "employer") {
      const jobs = await Job.find({
        status: "completed",
        employer: req.user.id
      })
        .select("title date durationHours applicants completedAt")
        .populate("applicants", "name email");
      return res.json({ role: "employer", history: jobs });
    }

    res.status(400).json({ error: "Rol no soportado para historial" });
  } catch (err) {
    console.error("Error obteniendo historial:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
