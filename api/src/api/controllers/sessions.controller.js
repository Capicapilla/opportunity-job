import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../../lib/models/user.model.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    req.session.user = { id: user._id.toString(), role: user.role };

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/logout", (req, res) => {
  try {
    req.session.destroy(() => {
      res.clearCookie("sid");
      res.json({ ok: true });
    });
  } catch (err) {
    console.error("Error en logout:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
