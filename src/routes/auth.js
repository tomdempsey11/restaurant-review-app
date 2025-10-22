// src/routes/auth.js
import { Router } from "express";
import {
  getLogin,
  getSignup,
  postSignup,
  postLogin,
  postLogout,
} from "../controllers/authController.js";

const router = Router();

router.get("/login", getLogin);
router.get("/signup", getSignup);
router.post("/signup", postSignup);
router.post("/login", postLogin);
router.post("/logout", postLogout);

export default router;
