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
  origin: [
    'https://opportunity-job.vercel.app',
    'https://opportunity-job-production.up.railway.app',
    /^https:\/\/opportunity-.*\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores antiguos
}));

// Manejar peticiones OPTIONS (preflight) explícitamente
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(morgan("dev"));
app.use(express.json());

// Sesiones de servidor almacenadas en Mongo
const isProduction = process.env.NODE_ENV === 'production';
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

// Arranque
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port}`);
  });
});
