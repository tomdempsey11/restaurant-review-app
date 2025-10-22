// routes/contact.js
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { postContact } from "../controllers/contactController.js";

const router = Router();

const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /contact — render form
router.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact",
    user: req.user,
    values: {
      name: req.user?.name ?? "",
      email: req.user?.email ?? "",
      subject: "",
      message: "",
    },
    errors: [],
  });
});

// POST /api/contact — validate + delegate to controller
router.post(
  "/api/contact",
  postLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 120 }),
    body("email").trim().isEmail().withMessage("Valid email required").isLength({ max: 200 }),
    body("subject").trim().notEmpty().withMessage("Subject is required").isLength({ max: 200 }),
    body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 5000 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If HTML form, re-render nicely; else JSON
      if (req.headers.accept?.includes("text/html")) {
        return res.status(400).render("contact", {
          title: "Contact",
          user: req.user,
          values: req.body,
          errors: errors.array(),
        });
      }
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    try {
      // postContact should handle DB save + response
      await postContact(req, res);

      // Fallback if controller didn't send a response:
      if (!res.headersSent) {
        if (req.headers.accept?.includes("text/html")) {
          req.flash?.("success", "Thanks! Your message has been sent.");
          return res.redirect("/contact");
        }
        return res.json({ ok: true });
      }
    } catch (err) {
      next(err);
    }
  }
);

export default router;
