// src/routes/userPages.js
import { Router } from "express";
const router = Router();

// Only allow logged-in users to view the profile page
function ensurePageAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl)}`);
}

// Profile (My Reviews) page shell — we'll add the view next step
router.get("/me", ensurePageAuth, (req, res) => {
  res.render("users/profile", { title: "My Reviews" });
});

export default router;
