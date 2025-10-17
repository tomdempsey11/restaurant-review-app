// src/routes/pages.js
import { Router } from "express";
const router = Router();

// Only allow logged-in users to view certain pages
function ensurePageAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl)}`);
}

// Browse page shell (client fetches /api/restaurants)
router.get("/", (req, res) => {
  res.render("restaurants/list", { title: "Browse Restaurants" });
});

// Restaurant details shell (client fetches /api/restaurants/:slug)
router.get("/:slug", (req, res) => {
  res.render("restaurants/show", { title: "Restaurant Details", slug: req.params.slug });
});

// ✅ Write Review page (PROTECTED)
router.get("/:slug/reviews/new", ensurePageAuth, (req, res) => {
  res.render("restaurants/write-review", { title: "Write a Review", slug: req.params.slug });
});

export default router;
