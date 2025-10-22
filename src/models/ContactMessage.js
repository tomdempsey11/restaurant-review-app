// src/models/ContactMessage.js
import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 120 },
    email:   { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

const ContactMessage = mongoose.model("ContactMessage", ContactMessageSchema);
export default ContactMessage;
