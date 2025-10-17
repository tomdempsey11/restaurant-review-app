import { User } from "../models/User.js";
import { signupSchema, loginSchema } from "../utils/validators.js";

export const getLogin = (req, res) => {
  res.render("auth/login", { title: "Login" });
};

export const getSignup = (req, res) => {
  res.render("auth/signup", { title: "Sign Up" });
};

export const postSignup = async (req, res) => {
  const { value, error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map(d => d.message).join(", ");
    return res.status(400).render("auth/signup", { title: "Sign Up", error: msg });
  }
  const { name, email, password } = value;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).render("auth/signup", { title: "Sign Up", error: "Email already registered" });
  }
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });
  req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
  res.redirect("/");
};

export const postLogin = async (req, res) => {
  const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map(d => d.message).join(", ");
    return res.status(400).render("auth/login", { title: "Login", error: msg });
  }
  const { email, password } = value;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(400).render("auth/login", { title: "Login", error: "Invalid credentials" });
  }
  req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
  const nextUrl = req.query.next || "/";
  res.redirect(nextUrl);
};

export const postLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};
