import Joi from "joi";

export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({ 'any.only': 'Passwords must match' })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const restaurantSchema = Joi.object({
  name: Joi.string().min(2).required(),
  slug: Joi.string().regex(/^[a-z0-9-]+$/).required().messages({ 'string.pattern.base': 'Slug must be lowercase letters, numbers, or hyphens' }),
  cuisine: Joi.string().required(),
  priceRange: Joi.string().valid("$", "$$", "$$$", "$$$$").default("$$"),
  address: Joi.string().required(),
  openHours: Joi.string().allow(""),
  photos: Joi.array().items(Joi.string()).default([])
});

export const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().min(2).max(120).required(),
  body: Joi.string().min(5).max(5000).required(),
  photos: Joi.array().items(Joi.string()).default([])
});
