const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    hall: String,
  },
  { timestamps: true },
);

// Ensure one vote per student per position
voteSchema.index({ studentId: 1, positionId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
