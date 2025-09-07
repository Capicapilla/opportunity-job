import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../../lib/models/user.model.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, age, socialSecurityNumber, email, password, role } = req.body;

    if (!name || !age || !socialSecurityNumber || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
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
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get("/", (req, res) => {
  res.json({ message: "ok users" });
});

export default router;
