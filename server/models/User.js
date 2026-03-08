const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // For email/password auth (optional)
    role: {
      type: String,
      enum: ["student", "admin", "superadmin"],
      default: "student",
    },
    registrationNumber: { type: String, required: true },
    batch: String,
    department: String,
    hall: {
      type: String,
      enum: [
        "Shah Paran Hall",
        "Bijoy 24 Hall",
        "Syed Mujtaba Ali Hall",
        "Ayesha Siddiqa Hall",
        "Begum Sirajunnesa Chowdhury Hall",
        "Fatimah Tuz Zahra Hall",
        "None",
      ],
      default: "None",
    },
    profilePhoto: String,
    bio: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
