// src/utils/validators.js
import Joi from "joi";

/* ---------- Auth ---------- */
export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Enter a valid email",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords must match",
    "any.required": "Please confirm your password",
  }),
  // ✅ Accept Terms checkbox: HTML sends "on" when checked
  accept: Joi.boolean().truthy("on", "true", "1").valid(true).required().messages({
    "any.only": "You must accept the terms",
    "any.required": "You must accept the terms",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Enter a valid email",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

/* ---------- Restaurants ---------- */
export const restaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({ "string.pattern.base": "Slug must be lowercase letters, numbers, or hyphens" }),
  cuisine: Joi.string().trim().required(),
  priceRange: Joi.string().valid("$", "$$", "$$$", "$$$$").default("$$"),
  address: Joi.string().trim().required(),
  openHours: Joi.string().trim().allow(""),
  photos: Joi.array().items(Joi.string().trim()).default([]),
});

/* ---------- Reviews ---------- */
export const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().min(2).max(120).required(),
  body: Joi.string().trim().min(5).max(5000).required(),
  photos: Joi.array().items(Joi.string().trim()).default([]),
});
