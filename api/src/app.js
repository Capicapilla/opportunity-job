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
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://opportunity-job.vercel.app',
        'https://opportunity-job-production.up.railway.app',
        /^https:\/\/opportunity-.*\.vercel\.app$/
      ]
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      secure: process.env.NODE_ENV === 'production',
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
