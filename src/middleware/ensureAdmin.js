// src/middleware/ensureAdmin.js
export default function ensureAdmin(req, res, next) {
  const u = req.user;
  if (u && (u.role === "admin" || u.isAdmin === true)) return next();

  if (req.accepts("html")) {
    req.flash?.("error", "Admins only.");
    // if you don't have a 403 view yet, swap this line for:
    // return res.status(403).send("Admins only");
    return res.status(403).render("errors/403", { message: "Admins only" });
  }
  return res.status(403).json({ error: "Forbidden" });
}
