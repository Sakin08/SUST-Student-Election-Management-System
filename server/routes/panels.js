const express = require("express");
const router = express.Router();
const Panel = require("../models/Panel");
const { protect, adminOnly } = require("../middleware/auth");

// Create panel (Admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { electionId, name, description, logo } = req.body;

    const panel = await Panel.create({
      electionId,
      name,
      description,
      logo,
    });

    res.status(201).json(panel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get panels by election
router.get("/election/:electionId", protect, async (req, res) => {
  try {
    const panels = await Panel.find({ electionId: req.params.electionId });
    res.json(panels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
