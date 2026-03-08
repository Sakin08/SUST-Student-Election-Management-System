const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "approve_candidate",
        "reject_candidate",
        "create_election",
        "update_election",
        "delete_election",
        "upload_voters",
        "publish_result",
        "add_eligible_voter",
        "bulk_add_eligible_voters",
        "csv_upload_eligible_voters",
        "auto_populate_eligible_voters",
        "remove_eligible_voter",
        "clear_eligible_voters",
        "update_voter_list_type",
      ],
      required: true,
    },
    targetId: mongoose.Schema.Types.ObjectId,
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
    details: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
