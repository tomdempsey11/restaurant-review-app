// src/middleware/auth.js

export function ensureAuth(req, res, next) {
  // Optional: debug log to verify sessions
  // console.log("🔍 ensureAuth sees session:", req.session);

  if (req.session && req.session.user) {
    // ✅ Attach user object so controllers can use req.user._id
    req.user = req.session.user;
    return next();
  }

  // Handle unauthenticated requests
  if (req.accepts("html")) {
    return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl)}`);
  }

  return res.status(401).json({ error: "Unauthorized" });
}

export function ensureAdmin(req, res, next) {
  // Optional: debug log to verify admin sessions
  // console.log("🔍 ensureAdmin sees session:", req.session);

  if (req.session?.user?.role === "admin") {
    req.user = req.session.user; // ✅ attach again for downstream use
    return next();
  }

  return res.status(403).json({ error: "Forbidden" });
}
