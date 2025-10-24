// scripts/seedAdmin.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../src/models/User.js';

const {
  MONGO_URI = 'mongodb://127.0.0.1:27017/restaurant_review',
  ADMIN_EMAIL = 'admin@example.com',
  ADMIN_NAME = 'Site Admin',
  ADMIN_PASSWORD = 'ChangeMe!123',
} = process.env;

async function main() {
  console.log('MONGO_URI =', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Force reset the password + ensure admin flags
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: ADMIN_NAME,
        role: 'admin',
        isAdmin: true,
        passwordHash, // <-- always updated to known value
      },
    },
    { upsert: true, new: true }
  );

  console.log('✅ Admin ensured:', user.email, 'role=', user.role, 'isAdmin=', !!user.isAdmin);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
