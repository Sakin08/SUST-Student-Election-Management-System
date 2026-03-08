const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Position = require("../models/Position");
const Election = require("../models/Election");
const { protect } = require("../middleware/auth");

// Cast vote
router.post("/", protect, async (req, res) => {
  try {
    const { candidateId, positionId, electionId } = req.body;

    // Check if election is in voting status
    const election = await Election.findById(electionId);
    if (election.status !== "voting") {
      return res.status(400).json({ message: "Voting is not active" });
    }

    // Check if society election - only department students can vote
    if (election.type === "society" && election.department) {
      if (req.user.department !== election.department) {
        return res.status(403).json({
          message:
            "শুধুমাত্র " +
            election.department +
            " বিভাগের শিক্ষার্থীরা ভোট দিতে পারবে",
        });
      }
    }

    // Check if CR election - only department + batch students can vote
    if (election.type === "cr" && election.department && election.batch) {
      if (req.user.department !== election.department) {
        return res.status(403).json({
          message:
            "শুধুমাত্র " +
            election.department +
            " বিভাগের শিক্ষার্থীরা ভোট দিতে পারবে",
        });
      }
      if (req.user.batch !== election.batch) {
        return res.status(403).json({
          message:
            "শুধুমাত্র " +
            election.batch +
            " ব্যাচের শিক্ষার্থীরা ভোট দিতে পারবে",
        });
      }
    }

    // Check if already voted for this position
    const existingVote = await Vote.findOne({
      studentId: req.user._id,
      positionId,
    });

    if (existingVote) {
      return res
        .status(400)
        .json({ message: "Already voted for this position" });
    }

    // Get candidate and position details
    const candidate = await Candidate.findById(candidateId);
    const position = await Position.findById(positionId);

    // Hall restriction check
    if (position.isHallSpecific && candidate.hall !== req.user.hall) {
      return res
        .status(403)
        .json({ message: "Cannot vote for candidates from other halls" });
    }

    const vote = await Vote.create({
      studentId: req.user._id,
      candidateId,
      positionId,
      electionId,
      hall: req.user.hall,
    });

    res.status(201).json({ message: "Vote cast successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Already voted for this position" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get results for an election
router.get("/results/:electionId", protect, async (req, res) => {
  try {
    const { electionId } = req.params;

    // Convert string to ObjectId
    const mongoose = require("mongoose");
    const electionObjectId = new mongoose.Types.ObjectId(electionId);

    const results = await Vote.aggregate([
      { $match: { electionId: electionObjectId } },
      {
        $group: {
          _id: {
            candidateId: "$candidateId",
            positionId: "$positionId",
          },
          voteCount: { $sum: 1 },
        },
      },
      { $sort: { voteCount: -1 } },
    ]);

    // Populate candidate details
    const populatedResults = await Candidate.populate(results, {
      path: "_id.candidateId",
      select: "studentId positionId panelId manifesto candidatePhoto",
      populate: [
        {
          path: "studentId",
          select: "name registrationNumber department profilePhoto",
        },
        { path: "positionId", select: "title isHallSpecific" },
        { path: "panelId", select: "name description" },
      ],
    });

    // Restructure the results for easier frontend consumption
    const formattedResults = populatedResults.map((result) => ({
      _id: result._id.candidateId,
      voteCount: result.voteCount,
      positionId: result._id.candidateId?.positionId,
      studentId: result._id.candidateId?.studentId,
      panelId: result._id.candidateId?.panelId,
      candidatePhoto: result._id.candidateId?.candidatePhoto,
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Results error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's votes for a specific election
router.get("/my-votes/:electionId", protect, async (req, res) => {
  try {
    const { electionId } = req.params;

    const votes = await Vote.find({
      studentId: req.user._id,
      electionId,
    }).populate("positionId", "title");

    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
