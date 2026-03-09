const express = require("express");
const router = express.Router();
const SSLCommerzPayment = require("sslcommerz-lts");
const Payment = require("../models/Payment");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const { protect } = require("../middleware/auth");

const store_id = process.env.SSLCZ_STORE_ID;
const store_passwd = process.env.SSLCZ_STORE_PASS;
const is_live = process.env.SSLCZ_IS_LIVE === "true";
const skip_payment = process.env.SKIP_PAYMENT === "true"; // For testing without payment gateway

// Initialize payment
router.post("/init", protect, async (req, res) => {
  try {
    const { electionId, positionId, amount } = req.body;

    // Validate required fields
    if (!electionId || !positionId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: electionId, positionId, or amount",
      });
    }

    // Skip payment for testing (if enabled)
    if (skip_payment) {
      const transactionId = `TEST${Date.now()}${req.user._id.toString().slice(-4)}`;

      // Create payment record with success status
      await Payment.create({
        studentId: req.user._id,
        electionId,
        positionId,
        amount,
        transactionId,
        status: "success",
      });

      // Return success URL that redirects to payment callback
      const successUrl = `${process.env.CLIENT_URL}/payment/success/${transactionId}`;

      return res.json({
        success: true,
        paymentUrl: successUrl,
        transactionId,
        testMode: true,
      });
    }

    // Validate SSLCommerz credentials
    if (!store_id || !store_passwd) {
      console.error("SSLCommerz credentials not configured");
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured",
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${req.user._id.toString().slice(-4)}`;

    // Create payment record
    const payment = await Payment.create({
      studentId: req.user._id,
      electionId,
      positionId,
      amount,
      transactionId,
      status: "pending",
    });

    const data = {
      total_amount: amount,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${req.protocol}://${req.get("host")}/api/payments/success/${transactionId}`,
      fail_url: `${req.protocol}://${req.get("host")}/api/payments/fail/${transactionId}`,
      cancel_url: `${req.protocol}://${req.get("host")}/api/payments/cancel/${transactionId}`,
      ipn_url: `${req.protocol}://${req.get("host")}/api/payments/ipn`,
      shipping_method: "NO",
      product_name: "Candidate Application Fee",
      product_category: "Election",
      product_profile: "non-physical-goods",
      cus_name: req.user.name,
      cus_email: req.user.email,
      cus_add1: req.user.hall || "SUST",
      cus_city: "Sylhet",
      cus_postcode: "3114",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
      ship_name: req.user.name,
      ship_add1: req.user.hall || "SUST",
      ship_city: "Sylhet",
      ship_postcode: "3114",
      ship_country: "Bangladesh",
    };

    console.log("Initializing SSLCommerz payment with data:", {
      ...data,
      store_id,
      is_live,
    });

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    console.log("SSLCommerz API response:", apiResponse);

    if (apiResponse.GatewayPageURL) {
      res.json({
        success: true,
        paymentUrl: apiResponse.GatewayPageURL,
        transactionId,
      });
    } else {
      await Payment.findByIdAndUpdate(payment._id, { status: "failed" });
      console.error("SSLCommerz initialization failed:", apiResponse);
      res.status(400).json({
        success: false,
        message: "Payment initialization failed",
        details: apiResponse,
      });
    }
  } catch (error) {
    console.error("Payment init error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Payment success callback (from SSLCommerz redirect)
router.get("/success/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { val_id, amount, card_type, card_issuer, bank_tran_id } = req.query;

    console.log("=== Payment Success GET Callback ===");
    console.log("Transaction ID:", transactionId);
    console.log("Request query:", req.query);

    // Check if payment exists
    const payment = await Payment.findOne({ transactionId }).catch((err) => {
      console.error("Database query error:", err);
      return null;
    });

    if (!payment) {
      console.error("Payment not found for transaction:", transactionId);
      const clientUrl =
        process.env.CLIENT_URL ||
        "https://sust-student-election-management-sy.vercel.app";
      return res.redirect(`${clientUrl}/payment/fail/${transactionId}`);
    }

    console.log("Payment found:", {
      id: payment._id,
      status: payment.status,
      amount: payment.amount,
    });

    // Update payment status if pending
    if (payment.status === "pending") {
      try {
        await Payment.findByIdAndUpdate(payment._id, {
          status: "success",
          bankTransactionId: bank_tran_id,
          cardType: card_type,
          cardIssuer: card_issuer,
          validatedOn: new Date(),
        });
        console.log("Payment updated to success:", transactionId);
      } catch (updateError) {
        console.error("Error updating payment:", updateError);
        // Continue anyway - payment was successful
      }
    } else {
      console.log(
        "Payment already processed:",
        transactionId,
        "Status:",
        payment.status,
      );
    }

    // Redirect to frontend with fallback
    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    const redirectUrl = `${clientUrl}/payment/success/${transactionId}`;
    console.log("Redirecting to:", redirectUrl);
    console.log("=== End Payment Success Callback ===");

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("=== Payment Success GET Error ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End Error ===");

    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    return res.redirect(
      `${clientUrl}/payment/fail/${req.params.transactionId}`,
    );
  }
});

// Payment success callback (POST from SSLCommerz)
router.post("/success/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { val_id, amount, card_type, card_issuer, bank_tran_id } = req.body;

    console.log("=== Payment Success POST Callback ===");
    console.log("Transaction ID:", transactionId);
    console.log("Request body:", req.body);
    console.log("Request query:", req.query);

    // Check if payment exists
    const payment = await Payment.findOne({ transactionId }).catch((err) => {
      console.error("Database query error:", err);
      return null;
    });

    if (!payment) {
      console.error("Payment not found for transaction:", transactionId);
      const clientUrl =
        process.env.CLIENT_URL ||
        "https://sust-student-election-management-sy.vercel.app";
      return res.redirect(`${clientUrl}/payment/fail/${transactionId}`);
    }

    console.log("Payment found:", {
      id: payment._id,
      status: payment.status,
      amount: payment.amount,
    });

    // Update payment status if pending
    if (payment.status === "pending") {
      try {
        await Payment.findByIdAndUpdate(payment._id, {
          status: "success",
          bankTransactionId: bank_tran_id,
          cardType: card_type,
          cardIssuer: card_issuer,
          validatedOn: new Date(),
        });
        console.log("Payment updated to success:", transactionId);
      } catch (updateError) {
        console.error("Error updating payment:", updateError);
        // Continue anyway - payment was successful
      }
    } else {
      console.log(
        "Payment already processed:",
        transactionId,
        "Status:",
        payment.status,
      );
    }

    // Redirect to frontend with fallback
    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    const redirectUrl = `${clientUrl}/payment/success/${transactionId}`;
    console.log("Redirecting to:", redirectUrl);
    console.log("=== End Payment Success Callback ===");

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("=== Payment Success POST Error ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Request params:", req.params);
    console.error("Request body:", req.body);
    console.error("=== End Error ===");

    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    return res.redirect(
      `${clientUrl}/payment/fail/${req.params.transactionId}`,
    );
  }
});

// Payment success callback (POST from SSLCommerz IPN)
router.post("/success", async (req, res) => {
  try {
    const { tran_id, val_id, amount, card_type, card_issuer, bank_tran_id } =
      req.body;

    const payment = await Payment.findOne({ transactionId: tran_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment status
    await Payment.findByIdAndUpdate(payment._id, {
      status: "success",
      bankTransactionId: bank_tran_id,
      cardType: card_type,
      cardIssuer: card_issuer,
      validatedOn: new Date(),
    });

    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.error("Payment success error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Payment fail callback (GET from SSLCommerz redirect)
router.get("/fail/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, { status: "failed" });
    }

    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    res.redirect(`${clientUrl}/payment/fail/${transactionId}`);
  } catch (error) {
    console.error("Payment fail error:", error);
    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    res.redirect(`${clientUrl}/payment/fail/${req.params.transactionId}`);
  }
});

// Payment fail callback (POST from SSLCommerz)
router.post("/fail/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, { status: "failed" });
    }

    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    res.redirect(`${clientUrl}/payment/fail/${transactionId}`);
  } catch (error) {
    console.error("Payment fail error:", error);
    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    res.redirect(`${clientUrl}/payment/fail/${req.params.transactionId}`);
  }
});

// Payment fail callback (POST)
router.post("/fail", async (req, res) => {
  try {
    const { tran_id } = req.body;

    const payment = await Payment.findOne({ transactionId: tran_id });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, { status: "failed" });
    }

    res.json({ success: false, message: "Payment failed" });
  } catch (error) {
    console.error("Payment fail error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Payment cancel callback (GET from SSLCommerz redirect)
router.get("/cancel/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, { status: "cancelled" });
    }

    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    res.redirect(`${clientUrl}/payment/cancel/${transactionId}`);
  } catch (error) {
    console.error("Payment cancel error:", error);
    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    res.redirect(`${clientUrl}/payment/cancel/${req.params.transactionId}`);
  }
});

// Payment cancel callback (POST from SSLCommerz)
router.post("/cancel/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, { status: "cancelled" });
    }

    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    res.redirect(`${clientUrl}/payment/cancel/${transactionId}`);
  } catch (error) {
    console.error("Payment cancel error:", error);
    const clientUrl =
      process.env.CLIENT_URL ||
      "https://sust-student-election-management-sy.vercel.app";
    res.redirect(`${clientUrl}/payment/cancel/${req.params.transactionId}`);
  }
});

// Payment cancel callback (POST)
router.post("/cancel", async (req, res) => {
  try {
    const { tran_id } = req.body;

    const payment = await Payment.findOne({ transactionId: tran_id });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, { status: "cancelled" });
    }

    res.json({ success: false, message: "Payment cancelled" });
  } catch (error) {
    console.error("Payment cancel error:", error);
    res.status(500).json({ message: error.message });
  }
});

// IPN (Instant Payment Notification)
router.post("/ipn", async (req, res) => {
  try {
    const { tran_id, status } = req.body;

    const payment = await Payment.findOne({ transactionId: tran_id });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, {
        status: status === "VALID" ? "success" : "failed",
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("IPN error:", error);
    res.sendStatus(500);
  }
});

// Check payment status (no auth required - uses transactionId)
router.get("/status/:transactionId", async (req, res) => {
  try {
    const payment = await Payment.findOne({
      transactionId: req.params.transactionId,
    }).populate("electionId positionId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
