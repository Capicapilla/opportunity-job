import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/opportunity-job",
  jwtSecret: process.env.JWT_SECRET || "capicapilla123",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || 7,
  sessionSecret: process.env.SESSION_SECRET || "super-secret-session",
  frontOrigin: process.env.FRONT_ORIGIN || "http://localhost:5173",
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT || 465,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM || "no-reply@opportunityjob.com",
};
