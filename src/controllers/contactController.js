import Joi from "joi";

const contactSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().min(2).required(),
  message: Joi.string().min(5).required()
});

export const postContact = (req, res) => {
  const { value, error } = contactSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });
  // For demo: just echo back; in production, send email or store.
  res.json({ ok: true, received: value });
};
