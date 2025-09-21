import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../../lib/models/user.model.js";
import { authMiddleware } from "../middlewares/auth.js";
import Job from "../../lib/models/job.model.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, lastName, age, socialSecurityNumber, email, password, role, companyName, companyDescription } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
    }

    // Validaciones específicas por rol
    if (role === 'worker') {
      if (!age || !socialSecurityNumber) {
        return res.status(400).json({ error: "Para trabajadores, edad y número de seguridad social son obligatorios" });
      }
    } else if (role === 'employer') {
      if (!companyName) {
        return res.status(400).json({ error: "Para empresas, el nombre de la empresa es obligatorio" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Crear objeto de usuario con campos específicos según el rol
    const userData = {
      name: lastName ? `${name} ${lastName}` : name, // Combinar nombre y apellidos
      email,
      passwordHash,
      role,
    };

    // Agregar campos específicos según el rol
    if (role === 'worker') {
      userData.age = age;
      userData.socialSecurityNumber = socialSecurityNumber;
    } else if (role === 'employer') {
      userData.age = age || 30; // Edad por defecto para empresas
      userData.companyName = companyName;
      userData.companyDescription = companyDescription;
    }

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      age: newUser.age,
      socialSecurityNumber: newUser.socialSecurityNumber,
      companyName: newUser.companyName,
      companyDescription: newUser.companyDescription,
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

// Actualizar perfil del usuario logueado
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { education, experience, skills, phone, address } = req.body;
    
    const updateData = {};
    if (education !== undefined) updateData.education = education;
    if (experience !== undefined) updateData.experience = experience;
    if (skills !== undefined) updateData.skills = skills;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error actualizando perfil:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Obtener perfil de un usuario específico (solo para empresarios)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Solo los empresarios pueden ver perfiles de usuarios" });
    }

    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error obteniendo perfil de usuario:", err);
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
