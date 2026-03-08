// Script to make a user superadmin
// Usage: node server/scripts/makeSuperAdmin.js <email>

require("dotenv").config({ path: "./server/.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node server/scripts/makeSuperAdmin.js <email>");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`📋 Current user details:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);

    if (user.role === "superadmin") {
      console.log("✅ User is already a superadmin");
      process.exit(0);
    }

    user.role = "superadmin";
    await user.save();

    console.log("✅ User updated to superadmin successfully!");
    console.log(`   New Role: ${user.role}`);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
