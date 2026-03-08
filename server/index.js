const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://sust-student-election-management-sy-lovat.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list or matches Vercel preview deployments
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require("./config/passport")(passport);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "✅ API working great! Deployment successful",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint to check OAuth config
app.get("/api/debug/oauth", (req, res) => {
  res.status(200).json({
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    clientURL: process.env.CLIENT_URL,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/elections", require("./routes/elections"));
app.use("/api/positions", require("./routes/positions"));
app.use("/api/panels", require("./routes/panels"));
app.use("/api/candidates", require("./routes/candidates"));
app.use("/api/votes", require("./routes/votes"));
app.use("/api/audit", require("./routes/audit"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/eligible-voters", require("./routes/eligibleVoters"));

// Serve static files from React build in production (not needed on Vercel)
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/build", "index.html"));
//   });
// }

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ MongoDB connected");
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`🚀 Server running on port ${PORT}`);
  }
});
