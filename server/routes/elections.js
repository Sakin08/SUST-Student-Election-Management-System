const express = require("express");
const router = express.Router();
const Election = require("../models/Election");
const AuditLog = require("../models/AuditLog");
const { protect, adminOnly, superAdminOnly } = require("../middleware/auth");

// Create election (Admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, type, hall, department, startDate, endDate } = req.body;

    const election = await Election.create({
      title,
      type,
      hall,
      department,
      startDate,
      endDate,
      createdBy: req.user._id,
    });

    await AuditLog.create({
      adminId: req.user._id,
      action: "create_election",
      targetId: election._id,
      electionId: election._id,
      details: `Created election: ${title}`,
    });

    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all elections
router.get("/", protect, async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single election
router.get("/:id", protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update election status (must be before /:id route)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    await AuditLog.create({
      adminId: req.user._id,
      action: "update_election",
      targetId: election._id,
      electionId: election._id,
      details: `Updated election status to: ${status}`,
    });

    res.json(election);
  } catch (error) {
    console.error("Error updating election status:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update election details (Super Admin only)
router.put("/:id", protect, superAdminOnly, async (req, res) => {
  try {
    const { title, type, hall, department, startDate, endDate } = req.body;

    console.log("Updating election:", req.params.id);
    console.log("Update data:", {
      title,
      type,
      hall,
      department,
      startDate,
      endDate,
    });

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { title, type, hall, department, startDate, endDate },
      { new: true },
    );

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    await AuditLog.create({
      adminId: req.user._id,
      action: "update_election",
      targetId: election._id,
      electionId: election._id,
      details: `Updated election details: ${title}`,
    });

    res.json(election);
  } catch (error) {
    console.error("Error updating election details:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete election (Super Admin only)
router.delete("/:id", protect, superAdminOnly, async (req, res) => {
  try {
    console.log("Deleting election:", req.params.id);

    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    await AuditLog.create({
      adminId: req.user._id,
      action: "delete_election",
      targetId: election._id,
      electionId: election._id,
      details: `Deleted election: ${election.title}`,
    });

    await Election.findByIdAndDelete(req.params.id);

    res.json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("Error deleting election:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
