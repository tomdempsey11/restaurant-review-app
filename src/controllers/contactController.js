// src/controllers/contactController.js
import ContactMessage from "../models/ContactMessage.js";

export const postContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Save to MongoDB
    const savedMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      userId: req.user?._id || null
    });

    // Respond for API / JSON calls
    res.json({ ok: true, received: savedMessage });
  } catch (err) {
    next(err);
  }
};
