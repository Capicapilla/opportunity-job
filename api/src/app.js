import express from "express";
import morgan from "morgan";
import cors from "cors";
import { config } from "./lib/config.js";
import { connectDB } from "./lib/db.js";
import apiRoutes from "./api/index.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use("/api", apiRoutes);

// Arranque
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port}`);
  });
});
