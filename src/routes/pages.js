// src/routes/pages.js
import { Router } from "express";

const router = Router();

// Public list page (client will call /api/restaurants)
router.get("/", (req, res) => {
  res.render("restaurants/list", {
    title: "Browse Restaurants",
  });
});

// Public details page (client will call /api/restaurants/:slug)
router.get("/:slug", (req, res) => {
  res.render("restaurants/show", {
    title: "Restaurant",
    slug: req.params.slug,
  });
});

// Auth-gated: write a review page
router.get("/:slug/reviews/new", (req, res) => {
  if (!req.user) {
    const nextUrl = `/restaurants/${req.params.slug}/reviews/new`;
    return res.redirect(`/auth/login?next=${encodeURIComponent(nextUrl)}`);
  }
  res.render("restaurants/write-review", {
    title: "Write a Review",
    slug: req.params.slug,
  });
});

export default router;
