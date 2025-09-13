import { Router } from "express";
import { sendEmail } from "../../lib/email.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const info = await sendEmail({
      to: "info@javiercapillamartinez.es",
      subject: "Test de Opportunity Job",
      html: "<h1>Hola</h1><p>Esto es una prueba. HHOooooooooola Holita Flanders</p>",
    });

    res.json({ message: "Email enviado", id: info.messageId });
  } catch (err) {
    console.error("Error enviando email:", err);
    res.status(500).json({ error: "No se pudo enviar el correo" });
  }
});

export default router;
