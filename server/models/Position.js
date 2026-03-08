const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    title: { type: String, required: true },
    maxWinners: { type: Number, default: 1 },
    isHallSpecific: { type: Boolean, default: false },
    // If isHallSpecific is true, candidates can only apply from their own hall
    isDepartmentSpecific: { type: Boolean, default: false },
    // If isDepartmentSpecific is true, candidates can only apply from their own department
    isBatchSpecific: { type: Boolean, default: false },
    // If isBatchSpecific is true, candidates can only apply from their own batch (CR elections)
  },
  { timestamps: true },
);

module.exports = mongoose.model("Position", positionSchema);
