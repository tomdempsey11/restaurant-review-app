import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
dotenv.config();

export function sessionConfig() {
  const ttl = 1000 * 60 * 60 * 24 * 7; // 7 days
  return {
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ttl
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: ttl / 1000
    })
  };
}
