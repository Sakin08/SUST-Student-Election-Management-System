const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    logo: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Panel", panelSchema);
