const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["hall", "main", "society", "cr"],
      required: true,
    },
    hall: { type: String }, // Only for hall elections
    department: { type: String }, // For society and CR elections
    batch: { type: String }, // For CR elections
    section: { type: String }, // For CR elections (A, B, C, etc.)
    applicationFee: { type: Number, default: 0 }, // Fee for candidate application
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    votingStartTime: { type: String }, // Time when voting starts (HH:MM format)
    votingEndTime: { type: String }, // Time when voting ends (HH:MM format)
    voterListType: {
      type: String,
      enum: ["all", "specific"],
      default: "all",
    },
    eligibleVoters: [
      {
        registrationNumber: String,
        hall: String, // For hall elections
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["created", "candidateFinalized", "voting", "completed"],
      default: "created",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Election", electionSchema);
