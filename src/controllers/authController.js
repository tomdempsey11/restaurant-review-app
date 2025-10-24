import { User } from "../models/User.js";
import { signupSchema, loginSchema } from "../utils/validators.js";

export const getLogin = (req, res) => {
  res.render("auth/login", { title: "Login", error: null, values: {} });
};

export const getSignup = (req, res) => {
  res.render("auth/signup", { title: "Sign Up", errors: [], values: {} });
};

export const postSignup = async (req, res) => {
  const { value, error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map(d => d.message).join(", ");
    return res.status(400).render("auth/signup", { title: "Sign Up", error: msg, values: req.body });
  }

  const name = (value.name || "").trim();
  const email = (value.email || "").trim().toLowerCase();            // ✅ normalize
  const password = value.password;

  const existing = await User.findOne({ email });                      // ✅ query with normalized email
  if (existing) {
    return res.status(400).render("auth/signup", { title: "Sign Up", error: "Email already registered", values: { name, email } });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });       // schema also lowercases, but we already did

  req.session.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  res.redirect("/");
};

export const postLogin = async (req, res) => {
  const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map(d => d.message).join(", ");
    return res.status(400).render("auth/login", { title: "Login", error: msg, values: req.body });
  }

  const email = (value.email || "").trim().toLowerCase();             // ✅ normalize
  const password = value.password;

  const user = await User.findOne({ email });                          // ✅ query with normalized email
  if (!user) {
    return res.status(400).render("auth/login", { title: "Login", error: "Invalid credentials", values: { email } });
  }

  const ok = await user.comparePassword(password);                     // compares against passwordHash
  if (!ok) {
    return res.status(400).render("auth/login", { title: "Login", error: "Invalid credentials", values: { email } });
  }

  req.session.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  const nextUrl = req.query.next || "/";
  res.redirect(nextUrl);
};

export const postLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};
