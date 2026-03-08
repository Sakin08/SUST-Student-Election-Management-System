const express = require("express");
const router = express.Router();
const Position = require("../models/Position");
const { protect, adminOnly } = require("../middleware/auth");

// Create position (Admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { electionId, title, maxWinners, isHallSpecific } = req.body;

    const position = await Position.create({
      electionId,
      title,
      maxWinners,
      isHallSpecific,
    });

    res.status(201).json(position);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get positions by election
router.get("/election/:electionId", protect, async (req, res) => {
  try {
    const positions = await Position.find({
      electionId: req.params.electionId,
    });
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
