// src/middleware/ensureLoggedIn.js
export default function ensureLoggedIn(req, res, next) {
  // Check if the user object exists in the session
  if (req.user) {
    return next();
  }

  // If not logged in, redirect to login page (for HTML) or send JSON for APIs
  if (req.accepts("html")) {
    req.flash?.("error", "Please log in first.");
    return res.redirect("/auth/login");
  }

  return res.status(401).json({ error: "Unauthorized" });
}
