// scripts/seedAdmin.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ⬇️ Adjust this import to match your actual export (named vs default)
import { User } from "../src/models/User.js"; // if default: `import User from ...`

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_NAME = process.env.ADMIN_NAME || "Site Admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe!123";

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  // find existing by email
  let u = await User.findOne({ email: ADMIN_EMAIL });

  if (!u) {
    // your schema expects passwordHash — so hash explicitly
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Create the admin
    u = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,          // ✅ REQUIRED by your schema
      role: "admin",
      isAdmin: true,
    });

    console.log("✅ Created admin:", ADMIN_EMAIL);
  } else {
    // Ensure admin flags are set
    const updates = {};
    if (!u.isAdmin) updates.isAdmin = true;
    if (u.role !== "admin") updates.role = "admin";

    // Optionally reset password each time (uncomment if you want to force-reset)
    // updates.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (Object.keys(updates).length) {
      await User.updateOne({ _id: u._id }, { $set: updates });
      console.log("✅ Ensured admin flags on existing account:", ADMIN_EMAIL);
    } else {
      console.log("ℹ️ Admin already exists:", ADMIN_EMAIL);
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
