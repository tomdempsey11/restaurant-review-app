import { Router } from "express";
import ContactMessage from "../models/ContactMessage.js";

const router = Router();

/**
 * GET /admin/contact-messages
 * Optional query params:
 *   - q: search (name, email, subject, message)
 *   - page: number (default 1)
 */
router.get("/contact-messages", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = q
      ? {
          $or: [
            { name:    { $regex: q, $options: "i" } },
            { email:   { $regex: q, $options: "i" } },
            { subject: { $regex: q, $options: "i" } },
            { message: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactMessage.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.render("admin/contact-messages", {
      title: "Contact Messages",
      user: req.user,
      messages,
      q,
      page,
      totalPages,
      total,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
