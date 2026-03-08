const express = require("express");
const router = express.Router();
const Election = require("../models/Election");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { protect, adminOnly } = require("../middleware/auth");
const multer = require("multer");
const csv = require("csv-parser");
const { Readable } = require("stream");

// Configure multer for CSV upload (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Add single voter
router.post("/:electionId/add", protect, adminOnly, async (req, res) => {
  try {
    const { registrationNumber, hall } = req.body;
    const { electionId } = req.params;

    console.log("=== Add Voter Request ===");
    console.log("Election ID:", electionId);
    console.log("Registration Number:", registrationNumber);
    console.log("Hall:", hall);

    if (!registrationNumber || registrationNumber.length !== 10) {
      return res.status(400).json({
        message: "রেজিস্ট্রেশন নম্বর ১০ ডিজিটের হতে হবে",
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      console.log("Election not found");
      return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
    }

    console.log("Election found:", election.title);
    console.log("Election type:", election.type);
    console.log("Current eligibleVoters:", election.eligibleVoters);
    console.log("Current voterListType:", election.voterListType);

    // Check if hall is required for hall elections
    if (election.type === "hall" && !hall) {
      return res.status(400).json({
        message: "হল নির্বাচনের জন্য হলের নাম প্রয়োজন",
      });
    }

    // Initialize fields if they don't exist
    if (!election.eligibleVoters) {
      console.log("Initializing eligibleVoters array");
      election.eligibleVoters = [];
    }
    if (!election.voterListType) {
      console.log("Initializing voterListType");
      election.voterListType = "all";
    }

    // Check if already exists (same registration number and hall for hall elections)
    const exists = election.eligibleVoters.some((v) => {
      if (election.type === "hall") {
        return v.registrationNumber === registrationNumber && v.hall === hall;
      }
      return v.registrationNumber === registrationNumber;
    });

    if (exists) {
      console.log("Voter already exists");
      return res.status(400).json({
        message: "এই রেজিস্ট্রেশন নম্বর ইতিমধ্যে যুক্ত আছে",
      });
    }

    console.log("Adding voter to array");
    const voterData = {
      registrationNumber,
      addedBy: req.user._id,
      addedAt: new Date(),
    };

    if (election.type === "hall") {
      voterData.hall = hall;
    }

    election.eligibleVoters.push(voterData);

    console.log("Saving election...");
    await election.save();
    console.log("Election saved successfully");

    await AuditLog.create({
      adminId: req.user._id,
      action: "add_eligible_voter",
      targetId: electionId,
      electionId: electionId,
      details: `Added voter: ${registrationNumber}${hall ? ` (${hall})` : ""}`,
    });

    console.log("=== Add Voter Success ===");
    res.json({
      message: "ভোটার সফলভাবে যুক্ত হয়েছে",
      count: election.eligibleVoters.length,
    });
  } catch (error) {
    console.error("=== Add voter error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: error.message });
  }
});

// Add multiple voters (bulk)
router.post("/:electionId/bulk", protect, adminOnly, async (req, res) => {
  try {
    const { registrationNumbers } = req.body;
    const { electionId } = req.params;

    if (
      !Array.isArray(registrationNumbers) ||
      registrationNumbers.length === 0
    ) {
      return res.status(400).json({
        message: "রেজিস্ট্রেশন নম্বরের তালিকা প্রদান করুন",
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
    }

    // Initialize fields if they don't exist
    if (!election.eligibleVoters) {
      election.eligibleVoters = [];
    }

    // Build existing voters set with hall support
    const existingNumbers = new Set(
      election.eligibleVoters.map((v) =>
        election.type === "hall"
          ? `${v.registrationNumber}-${v.hall}`
          : v.registrationNumber,
      ),
    );

    let added = 0;
    let skipped = 0;
    const errors = [];

    for (const item of registrationNumbers) {
      // Handle both string format and object format
      let regNum, hall;

      if (typeof item === "object" && item.registrationNumber) {
        // Object format: {registrationNumber: "2021331008", hall: "SPH"}
        regNum = item.registrationNumber.trim();
        hall = item.hall ? item.hall.trim() : null;
      } else if (typeof item === "string") {
        // String format: "2021331008" or "2021331008,SPH"
        const parts = item.split(",").map((p) => p.trim());
        regNum = parts[0];
        hall = parts.length > 1 ? parts[1] : null;
      } else {
        errors.push(`Invalid format: ${JSON.stringify(item)}`);
        continue;
      }

      // Validate registration number
      if (regNum.length !== 10) {
        errors.push(`${regNum}: অবৈধ দৈর্ঘ্য`);
        continue;
      }

      // For hall elections, hall is required
      if (election.type === "hall" && !hall) {
        errors.push(`${regNum}: হলের নাম প্রয়োজন`);
        continue;
      }

      // Build unique key
      const key = election.type === "hall" ? `${regNum}-${hall}` : regNum;

      // Skip if exists
      if (existingNumbers.has(key)) {
        skipped++;
        continue;
      }

      // Add voter
      const voterData = {
        registrationNumber: regNum,
        addedBy: req.user._id,
        addedAt: new Date(),
      };

      if (election.type === "hall" && hall) {
        voterData.hall = hall;
      }

      election.eligibleVoters.push(voterData);
      existingNumbers.add(key);
      added++;
    }

    await election.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: "bulk_add_eligible_voters",
      targetId: electionId,
      electionId: electionId,
      details: `Added ${added} voters, skipped ${skipped}`,
    });

    res.json({
      message: `${added} জন ভোটার যুক্ত হয়েছে, ${skipped} জন বাদ দেওয়া হয়েছে`,
      added,
      skipped,
      errors,
      totalCount: election.eligibleVoters.length,
    });
  } catch (error) {
    console.error("Bulk add error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Upload CSV file
router.post(
  "/:electionId/upload-csv",
  protect,
  adminOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      const { electionId } = req.params;

      console.log("=== CSV Upload Request ===");
      console.log("Election ID:", electionId);

      if (!req.file) {
        return res.status(400).json({ message: "ফাইল আপলোড করুন" });
      }

      console.log("File received:", req.file.originalname);
      console.log("File size:", req.file.size);

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
      }

      // Initialize if doesn't exist
      if (!election.eligibleVoters) {
        election.eligibleVoters = [];
      }

      const registrationNumbers = [];
      const buffer = req.file.buffer;
      const content = buffer.toString();

      console.log("CSV Content preview:", content.substring(0, 200));

      // Try multiple parsing strategies
      const lines = content.split(/\r?\n/);
      console.log("Total lines in CSV:", lines.length);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // For hall elections, expect format: registrationNumber,hall
        // For other elections, just: registrationNumber
        if (election.type === "hall") {
          // Parse: 2021331008,SPH or 2021331008, SPH
          const parts = line
            .split(",")
            .map((p) => p.trim().replace(/['"]/g, ""));

          if (parts.length >= 2) {
            const regNum = parts[0];
            const hall = parts[1];

            if (/^\d{10}$/.test(regNum) && hall) {
              registrationNumbers.push({ registrationNumber: regNum, hall });
              console.log(`Line ${i + 1}: Found ${regNum} - ${hall}`);
            } else if (i > 0) {
              console.log(`Line ${i + 1}: Invalid format: "${line}"`);
            }
          } else if (i > 0) {
            console.log(`Line ${i + 1}: Missing hall code: "${line}"`);
          }
        } else {
          // For non-hall elections, just registration number
          const cleaned = line.replace(/[",]/g, "").trim();

          if (/^\d{10}$/.test(cleaned)) {
            registrationNumbers.push({ registrationNumber: cleaned });
            console.log(`Line ${i + 1}: Found registration number: ${cleaned}`);
          } else if (cleaned.length > 0 && i > 0) {
            console.log(`Line ${i + 1}: Skipped invalid format: "${cleaned}"`);
          }
        }
      }

      console.log(
        "Total registration numbers found:",
        registrationNumbers.length,
      );

      if (registrationNumbers.length === 0) {
        const formatMsg =
          election.type === "hall"
            ? "CSV ফাইলে কোনো বৈধ ডেটা পাওয়া যায়নি। Format: registrationNumber,hall (e.g., 2021331008,SPH)"
            : "CSV ফাইলে কোনো বৈধ রেজিস্ট্রেশন নম্বর পাওয়া যায়নি। নিশ্চিত করুন যে প্রতিটি নম্বর ১০ ডিজিটের।";

        return res.status(400).json({ message: formatMsg });
      }

      // Use bulk add logic
      const existingNumbers = new Set(
        election.eligibleVoters.map((v) =>
          election.type === "hall"
            ? `${v.registrationNumber}-${v.hall}`
            : v.registrationNumber,
        ),
      );

      let added = 0;
      let skipped = 0;
      const errors = [];

      for (const item of registrationNumbers) {
        const key =
          election.type === "hall"
            ? `${item.registrationNumber}-${item.hall}`
            : item.registrationNumber;

        if (existingNumbers.has(key)) {
          skipped++;
          console.log(`Skipped (already exists): ${key}`);
          continue;
        }

        const voterData = {
          registrationNumber: item.registrationNumber,
          addedBy: req.user._id,
          addedAt: new Date(),
        };

        if (election.type === "hall" && item.hall) {
          voterData.hall = item.hall;
        }

        election.eligibleVoters.push(voterData);
        existingNumbers.add(key);
        added++;
        console.log(`Added: ${key}`);
      }

      await election.save();
      console.log("Election saved successfully");

      await AuditLog.create({
        adminId: req.user._id,
        action: "csv_upload_eligible_voters",
        targetId: electionId,
        electionId: electionId,
        details: `CSV upload: Added ${added} voters, skipped ${skipped}`,
      });

      console.log("=== CSV Upload Complete ===");
      console.log("Added:", added);
      console.log("Skipped:", skipped);
      console.log("Total in list:", election.eligibleVoters.length);

      res.json({
        message: `CSV থেকে ${added} জন ভোটার যুক্ত হয়েছে${skipped > 0 ? `, ${skipped} জন ইতিমধ্যে ছিল` : ""}`,
        added,
        skipped,
        errors: errors.slice(0, 10),
        totalCount: election.eligibleVoters.length,
        foundInFile: registrationNumbers.length,
      });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Auto-populate from department/batch
router.post(
  "/:electionId/auto-populate",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { department, batch } = req.body;
      const { electionId } = req.params;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
      }

      // Build query
      const query = {};
      if (department) query.department = department;
      if (batch) query.batch = batch;

      // Find matching users
      const users = await User.find(query).select("registrationNumber");

      if (users.length === 0) {
        return res.status(404).json({
          message: "কোনো শিক্ষার্থী পাওয়া যায়নি",
        });
      }

      const existingNumbers = new Set(
        election.eligibleVoters.map((v) => v.registrationNumber),
      );

      let added = 0;
      let skipped = 0;

      for (const user of users) {
        if (!user.registrationNumber) continue;

        if (existingNumbers.has(user.registrationNumber)) {
          skipped++;
          continue;
        }

        election.eligibleVoters.push({
          registrationNumber: user.registrationNumber,
          addedBy: req.user._id,
          addedAt: new Date(),
        });
        existingNumbers.add(user.registrationNumber);
        added++;
      }

      await election.save();

      await AuditLog.create({
        adminId: req.user._id,
        action: "auto_populate_eligible_voters",
        targetId: electionId,
        electionId: electionId,
        details: `Auto-populated: ${added} voters from ${department || "all"} ${batch || "all batches"}`,
      });

      res.json({
        message: `${added} জন ভোটার স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে`,
        added,
        skipped,
        totalCount: election.eligibleVoters.length,
      });
    } catch (error) {
      console.error("Auto-populate error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Remove voter
router.delete(
  "/:electionId/remove/:registrationNumber",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { electionId, registrationNumber } = req.params;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
      }

      // Initialize if doesn't exist
      if (!election.eligibleVoters) {
        election.eligibleVoters = [];
      }

      const initialLength = election.eligibleVoters.length;
      election.eligibleVoters = election.eligibleVoters.filter(
        (v) => v.registrationNumber !== registrationNumber,
      );

      if (election.eligibleVoters.length === initialLength) {
        return res.status(404).json({
          message: "ভোটার পাওয়া যায়নি",
        });
      }

      await election.save();

      await AuditLog.create({
        adminId: req.user._id,
        action: "remove_eligible_voter",
        targetId: electionId,
        electionId: electionId,
        details: `Removed voter: ${registrationNumber}`,
      });

      res.json({
        message: "ভোটার সরানো হয়েছে",
        count: election.eligibleVoters.length,
      });
    } catch (error) {
      console.error("Remove voter error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Get eligible voters list
router.get("/:electionId", protect, async (req, res) => {
  try {
    const { electionId } = req.params;
    const { page = 1, limit = 50, search = "" } = req.query;

    const election = await Election.findById(electionId).select(
      "eligibleVoters voterListType",
    );

    if (!election) {
      return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
    }

    // Initialize fields if they don't exist
    const voterListType = election.voterListType || "all";
    let voters = election.eligibleVoters || [];

    // Search filter
    if (search) {
      voters = voters.filter((v) =>
        v.registrationNumber.includes(search.trim()),
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedVoters = voters.slice(startIndex, endIndex);

    res.json({
      voterListType,
      voters: paginatedVoters,
      totalCount: voters.length,
      page: parseInt(page),
      totalPages: Math.ceil(voters.length / limit),
    });
  } catch (error) {
    console.error("Get voters error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update voter list type
router.put("/:electionId/type", protect, adminOnly, async (req, res) => {
  try {
    const { electionId } = req.params;
    const { voterListType } = req.body;

    if (!["all", "specific"].includes(voterListType)) {
      return res.status(400).json({ message: "অবৈধ ভোটার তালিকা ধরন" });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
    }

    // Initialize fields if they don't exist
    if (!election.voterListType) {
      election.voterListType = "all";
    }
    if (!election.eligibleVoters) {
      election.eligibleVoters = [];
    }

    election.voterListType = voterListType;
    await election.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: "update_voter_list_type",
      targetId: electionId,
      electionId: electionId,
      details: `Changed voter list type to: ${voterListType}`,
    });

    res.json({
      message: "ভোটার তালিকা ধরন আপডেট হয়েছে",
      voterListType: election.voterListType,
    });
  } catch (error) {
    console.error("Update type error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Check if user is eligible to vote
router.get("/:electionId/check-eligibility", protect, async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
    }

    // Initialize fields if they don't exist
    const voterListType = election.voterListType || "all";
    const eligibleVoters = election.eligibleVoters || [];

    // If voter list type is 'all', everyone is eligible
    if (voterListType === "all") {
      return res.json({
        eligible: true,
        reason: "সকল যোগ্য শিক্ষার্থী ভোট দিতে পারবেন",
      });
    }

    // Check if user's registration number is in the list
    const voterRecord = eligibleVoters.find(
      (v) => v.registrationNumber === req.user.registrationNumber,
    );

    if (voterRecord) {
      // Return eligibility with hall information
      return res.json({
        eligible: true,
        reason: "আপনি এই নির্বাচনে ভোট দেওয়ার যোগ্য",
        hall: voterRecord.hall || null, // Return the hall from admin's input
      });
    }

    res.json({
      eligible: false,
      reason:
        election.type === "hall"
          ? "আপনি এই হল নির্বাচনে ভোট দেওয়ার যোগ্য নন"
          : "আপনি এই নির্বাচনে ভোট দেওয়ার যোগ্য নন",
    });
  } catch (error) {
    console.error("Check eligibility error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Clear all eligible voters
router.delete("/:electionId/clear", protect, adminOnly, async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "নির্বাচন পাওয়া যায়নি" });
    }

    const count = election.eligibleVoters.length;
    election.eligibleVoters = [];
    await election.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: "clear_eligible_voters",
      targetId: electionId,
      electionId: electionId,
      details: `Cleared ${count} voters`,
    });

    res.json({
      message: `${count} জন ভোটার সরানো হয়েছে`,
      count: 0,
    });
  } catch (error) {
    console.error("Clear voters error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
