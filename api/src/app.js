import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { config } from "./lib/config.js";
import { connectDB } from "./lib/db.js";
import apiRoutes from "./api/index.js";

const app = express();

// Configuración de CORS más permisiva para debugging
const isProduction = process.env.NODE_ENV === 'production';
app.use(cors({
  origin: isProduction ? [
    'https://opportunity-job.vercel.app',
    'https://opportunity-job-production.up.railway.app',
    /^https:\/\/opportunity-.*\.vercel\.app$/,
    /^https:\/\/opportunity-.*-javier-capilla\.vercel\.app$/,
    /^https:\/\/opportunity-job-git-.*-javier-capilla\.vercel\.app$/, // Dominios de ramas de Git
    /^https:\/\/.*\.vercel\.app$/ // Permitir todos los dominios de Vercel temporalmente
  ] : [
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores antiguos
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
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Rutas
app.use("/api", apiRoutes);

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port}`);
  });
});
