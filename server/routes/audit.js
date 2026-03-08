const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const { protect, adminOnly } = require("../middleware/auth");

// Get audit logs (Admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { electionId } = req.query;
    const query = electionId ? { electionId } : {};

    const logs = await AuditLog.find(query)
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
