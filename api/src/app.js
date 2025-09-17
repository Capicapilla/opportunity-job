import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { config } from "./lib/config.js";
import { connectDB } from "./lib/db.js";
import apiRoutes from "./api/index.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());

// Sesiones de servidor almacenadas en Mongo
app.use(
  session({
    name: "sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: config.mongoUri }),
    cookie: {
      httpOnly: true,
      sameSite: "lax", // usar "none" y secure:true si el front está en otro dominio HTTPS
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Rutas
app.use("/api", apiRoutes);

// Arranque
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port}`);
  });
});
