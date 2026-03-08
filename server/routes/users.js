const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { uploadProfile } = require("../config/upload");

// Upload profile photo
router.post(
  "/profile-photo",
  protect,
  uploadProfile.single("profilePhoto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Cloudinary URL is available in req.file.path
      const photoUrl = req.file.path;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profilePhoto: photoUrl },
        { new: true },
      );

      res.json({ photoUrl, user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Update profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { hall, profilePhoto, bio, socialLinks } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { hall, profilePhoto, bio, socialLinks },
      { new: true },
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
