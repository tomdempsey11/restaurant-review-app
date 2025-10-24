// src/routes/pages.js
import { Router } from "express";

const router = Router();

// Public list page (client will call /api/restaurants)
// Pass current query params so the EJS can render filters & pager state
router.get("/", (req, res) => {
  const { q = "", cuisine = "", price = "", sort = "new", page = 1, limit = 9 } = req.query;

  res.render("restaurants/list", {
    title: "Browse Restaurants",
    user: req.user,
    // expose query values to EJS for pre-filling controls and building pager links
    q,
    cuisine,
    price,
    sort,
    page: Number(page) || 1,
    limit: Number(limit) || 9,
  });
});

// Public detail page
router.get("/:slug", (req, res) => {
  res.render("restaurants/detail", {
    title: "Restaurant",
    slug: req.params.slug,
    user: req.user,
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
    user: req.user,
  });
});

export default router;
