const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    panelId: { type: mongoose.Schema.Types.ObjectId, ref: "Panel" },
    hall: String,
    manifesto: { type: String, required: true },
    candidatePhoto: String, // Photo specifically for this election candidacy
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid"],
      default: "not_required",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Candidate", candidateSchema);
