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
