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
import contactRouter from "./routes/contact.js";
import pagesRouter from "./routes/pages.js";
import userPagesRouter from "./routes/userPages.js"; // ✅ ADD THIS

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// View engine (EJS)
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: false
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Sessions BEFORE routers
app.use(session(sessionConfig()));

// Make `user` available to all views
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Page routers (server-rendered)
app.use("/restaurants", pagesRouter);
app.use("/", userPagesRouter); // ✅ ADD THIS (exposes /me)

// API routers
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", userRouter);
app.use("/api/contact", contactRouter);

// 404
app.use((req, res) => {
  if (req.accepts("html")) return res.status(404).render("404", { title: "Not Found" });
  res.status(404).json({ error: "Not Found" });
});

// 500
app.use((err, req, res, next) => {
  console.error(err);
  if (req.accepts("html")) return res.status(500).render("500", { title: "Server Error" });
  res.status(500).json({ error: "Server Error" });
});
