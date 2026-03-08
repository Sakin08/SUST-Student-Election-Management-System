const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const Position = require("../models/Position");
const AuditLog = require("../models/AuditLog");
const { protect, adminOnly } = require("../middleware/auth");
const { uploadCandidate } = require("../config/upload");

// Apply as candidate
router.post(
  "/",
  protect,
  uploadCandidate.single("candidatePhoto"),
  async (req, res) => {
    try {
      const { positionId, electionId, panelId, manifesto } = req.body;

      // Check if position is hall-specific or department-specific
      const position =
        await Position.findById(positionId).populate("electionId");

      if (
        position.isHallSpecific &&
        (!req.user.hall || req.user.hall === "None")
      ) {
        return res
          .status(400)
          .json({ message: "Hall selection required for this position" });
      }

      // Check if position is department-specific (society election)
      if (position.isDepartmentSpecific && position.electionId) {
        const election = position.electionId;
        if (
          election.department &&
          election.department !== req.user.department
        ) {
          return res.status(403).json({
            message:
              "শুধুমাত্র " +
              election.department +
              " বিভাগের শিক্ষার্থীরা আবেদন করতে পারবে",
          });
        }
      }

      // Check if already applied
      const existing = await Candidate.findOne({
        studentId: req.user._id,
        positionId,
        electionId,
      });

      if (existing) {
        return res
          .status(400)
          .json({ message: "Already applied for this position" });
      }

      // Cloudinary URL is available in req.file.path
      const candidatePhoto = req.file ? req.file.path : null;

      const candidate = await Candidate.create({
        studentId: req.user._id,
        positionId,
        electionId,
        panelId: panelId && panelId.trim() !== "" ? panelId : null,
        hall: position.isHallSpecific ? req.user.hall : null,
        manifesto,
        candidatePhoto,
      });

      res.status(201).json(candidate);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Get candidates by election
router.get("/election/:electionId", protect, async (req, res) => {
  try {
    const candidates = await Candidate.find({
      electionId: req.params.electionId,
    })
      .populate(
        "studentId",
        "name registrationNumber department batch profilePhoto",
      )
      .populate("positionId", "title")
      .populate("panelId", "name logo");
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user's candidate applications
router.get("/my-applications", protect, async (req, res) => {
  try {
    const candidates = await Candidate.find({
      studentId: req.user._id,
    })
      .populate("positionId", "title isHallSpecific")
      .populate("electionId", "title type status startDate endDate")
      .populate("panelId", "name description")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject candidate (Admin only)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true },
    );

    await AuditLog.create({
      adminId: req.user._id,
      action: status === "approved" ? "approve_candidate" : "reject_candidate",
      targetId: candidate._id,
      electionId: candidate.electionId,
      details: `${status} candidate for position`,
    });

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
