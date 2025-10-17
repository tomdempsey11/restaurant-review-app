export function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  if (req.accepts("html")) return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl)}`);
  return res.status(401).json({ error: "Unauthorized" });
}

export function ensureAdmin(req, res, next) {
  if (req.session?.user?.role === "admin") return next();
  return res.status(403).json({ error: "Forbidden" });
}
