// routes/index.js
import { Router } from "express";
import { Restaurant } from "../models/Restaurant.js"; // adjust path if needed

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const featured = await Restaurant.find({})
      .sort({ avgRating: -1, createdAt: -1 })
      .limit(10)
      .lean();

    res.render("home", {
      title: "Home",
      user: req.session.user || null,
      featured,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
