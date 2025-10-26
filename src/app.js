// src/app.js
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { sessionConfig } from "./config/session.js";
import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import restaurantRouter from "./routes/restaurants.js";
import reviewRouter from "./routes/reviews.js";
import userRouter from "./routes/users.js";
import pagesRouter from "./routes/pages.js";
import userPagesRouter from "./routes/userPages.js";
import adminRouter from "./routes/admin.js";
import ensureLoggedIn from "./middleware/ensureLoggedIn.js";
import ensureAdmin from "./middleware/ensureAdmin.js";
import adminContactRouter from "./routes/adminContact.js";
import contactRouter from "./routes/contact.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

export const app = express();

// ---------- Proxy Trust ----------
if (isProd) app.set("trust proxy", 1);

// ---------- View Engine ----------
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// ---------- Security ----------
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: isProd ? undefined : false,
  })
);

// ---------- CORS ----------
app.use(cors({ origin: true, credentials: true }));

// ---------- Logging ----------
if (!isTest) app.use(morgan("dev"));

// ---------- Body + Cookie Parsing ----------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ---------- Sessions ----------
app.use(session(sessionConfig()));

// ---------- Globals ----------
app.use((req, res, next) => {
  req.user = req.session?.user || null;
  res.locals.user = req.user;
  res.locals.currentPath = req.path;
  next();
});

// ✅ ---------- Static Files (MOVED ABOVE ROUTES) ----------
app.use(express.static(path.join(__dirname, "../public"), { index: false }));

// ---------- ROUTES ----------
app.use("/", indexRouter);            // Home, etc.
app.use("/restaurants", pagesRouter); // SSR pages
app.use("/", userPagesRouter);        // /me, etc.
app.use("/auth", authRouter);         // Auth routes
app.use("/admin", ensureLoggedIn, ensureAdmin, adminRouter);
app.use("/admin", ensureLoggedIn, ensureAdmin, adminContactRouter);

// API routes
app.use("/api/restaurants", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use("/api/restaurants", restaurantRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", userRouter);
app.use(contactRouter);

// ---------- 404 ----------
app.use((req, res) => {
  if (req.accepts("html")) {
    return res.status(404).render("404", { title: "Not Found" });
  }
  res.status(404).json({ error: "Not Found" });
});

// ---------- 500 ----------
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err);
  if (req.accepts("html")) {
    return res.status(500).render("500", { title: "Server Error" });
  }
  res.status(500).json({ error: "Server Error" });
});
