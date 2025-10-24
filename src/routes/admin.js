// src/routes/admin.js
import { Router } from "express";
import slugify from "slugify";
import { Restaurant } from "../models/Restaurant.js";

const router = Router();

// 🧭 Admin restaurant list (with optional search + pagination)
router.get("/restaurants", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = 20;

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { cuisine: { $regex: q, $options: "i" } },
            { address: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
      Restaurant.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    res.render("admin/restaurants/index", {
      restaurants,
      q,
      page,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
});

// ➕ New form
router.get("/restaurants/new", (req, res) => {
  res.render("admin/restaurants/form", { mode: "create", restaurant: {} });
});

// 🧱 Create restaurant
router.post("/restaurants", async (req, res, next) => {
  try {
    const { name, address, cuisine, phone, website, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    await Restaurant.create({
      name,
      slug,
      address,
      cuisine,
      phone,
      website,
      description,
    });
    res.redirect("/admin/restaurants");
  } catch (err) {
    next(err);
  }
});

// ✏️ Edit form
router.get("/restaurants/:id/edit", async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) return res.status(404).render("errors/404");
    res.render("admin/restaurants/form", { mode: "edit", restaurant });
  } catch (err) {
    next(err);
  }
});

// 💾 Update
router.post("/restaurants/:id", async (req, res, next) => {
  try {
    const { name, address, cuisine, phone, website, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, slug, address, cuisine, phone, website, description },
      { runValidators: true }
    );
    res.redirect("/admin/restaurants");
  } catch (err) {
    next(err);
  }
});

// 🗑️ Delete
router.post("/restaurants/:id/delete", async (req, res, next) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.redirect("/admin/restaurants");
  } catch (err) {
    next(err);
  }
});

export default router;
