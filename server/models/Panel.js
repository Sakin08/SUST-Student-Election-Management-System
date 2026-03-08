const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    name: { type: String, required: true },
    hall: { type: String }, // For hall elections - which hall this panel belongs to (SPH, SMAH, etc.)
    description: String,
    logo: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Panel", panelSchema);
