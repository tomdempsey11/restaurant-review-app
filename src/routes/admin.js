// src/routes/admin.js
import { Router } from "express";
import slugify from "slugify";
import { Restaurant } from "../models/Restaurant.js";  // ✅ named import

const router = Router();

// List
router.get("/restaurants", async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({}).sort({ name: 1 }).lean();
    res.render("admin/restaurants/index", { restaurants });
  } catch (err) { next(err); }
});

// New (form)
router.get("/restaurants/new", (req, res) => {
  res.render("admin/restaurants/form", { mode: "create", restaurant: {} });
});

// Create
router.post("/restaurants", async (req, res, next) => {
  try {
    const { name, address, cuisine, phone, website, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    await Restaurant.create({ name, slug, address, cuisine, phone, website, description });
    req.flash?.("success", "Restaurant created");
    res.redirect("/admin/restaurants");
  } catch (err) { next(err); }
});

// Edit (form)
router.get("/restaurants/:id/edit", async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) return res.status(404).render("errors/404");
    res.render("admin/restaurants/form", { mode: "edit", restaurant });
  } catch (err) { next(err); }
});

// Update
router.post("/restaurants/:id", async (req, res, next) => {
  try {
    const { name, address, cuisine, phone, website, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, slug, address, cuisine, phone, website, description },
      { runValidators: true }
    );
    req.flash?.("success", "Restaurant updated");
    res.redirect("/admin/restaurants");
  } catch (err) { next(err); }
});

// Delete
router.post("/restaurants/:id/delete", async (req, res, next) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    req.flash?.("success", "Restaurant deleted");
    res.redirect("/admin/restaurants");
  } catch (err) { next(err); }
});

export default router;
