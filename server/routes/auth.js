const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { parseStudentEmail } = require("../utils/registrationParser");

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Register with email/password (Testing only - SUST email required)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate SUST email
    if (!email.endsWith("@student.sust.edu")) {
      return res.status(400).json({
        message: "শুধুমাত্র SUST student email (@student.sust.edu) অনুমোদিত",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট রয়েছে" });
    }

    // Parse email using utility
    const parsed = parseStudentEmail(email);

    let registrationNumber = email.split("@")[0];
    let batch = null;
    let department = null;

    if (parsed.isValid) {
      registrationNumber = parsed.fullRegNumber;
      batch = parsed.batch;
      department = parsed.department;
    } else {
      return res.status(400).json({
        message: `অবৈধ রেজিস্ট্রেশন নম্বর: ${parsed.error}`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      registrationNumber,
      batch,
      department,
      hall: "None",
      role: "student",
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .status(201)
      .json({ token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Login with email/password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "ইমেইল অথবা পাসওয়ার্ড ভুল" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "ইমেইল অথবা পাসওয়ার্ড ভুল" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // Fetch fresh user data from database
      const user = await User.findById(req.user._id);
      console.log("Google callback - Fresh user from DB:", user);
      console.log("Google callback - User role:", user.role);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log(
        "Token created for user:",
        user.email,
        "with role:",
        user.role,
      );
      console.log(
        "Redirecting to:",
        `${process.env.CLIENT_URL}/auth/success?token=${token}`,
      );
      res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error("Error in Google callback:", error);
      res.redirect("/login");
    }
  },
);

// Get current user
router.get("/me", protect, async (req, res) => {
  try {
    console.log(
      "GET /me - Returning user:",
      req.user.email,
      "Role:",
      req.user.role,
    );
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint to check role
router.get("/check-role", protect, async (req, res) => {
  try {
    const freshUser = await User.findById(req.user._id);
    res.json({
      fromToken: req.user.role,
      fromDatabase: freshUser.role,
      isSuperAdmin: freshUser.role === "superadmin",
      user: freshUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
