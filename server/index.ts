import express from "express";
import { createServer as createHttpServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";
import { testConnection } from "./db/connection";
import { handleDemo } from "./routes/demo";
import {
  createScan,
  getScanHistory,
  getScanById,
  deleteScan,
  getAnalytics,
  analyzeMessage,
} from "./routes/scanHistory";
import {
  analyzeSocialMediaContent,
  getSocialMediaAnalytics,
  getSocialMediaHistory,
  getSocialMediaAnalysisById,
  deleteSocialMediaAnalysis,
  exportSocialMediaReport,
  socialMediaHealthCheck,
} from "./routes/socialMedia";

import {
  sendOTP,
  verifyOTP,
  resendOTP,
  getOTPStatus,
} from "./routes/otp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer() {
  return createApp();
}

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Trust proxy for IP detection
  app.set("trust proxy", true);

  // API Routes
  app.get("/api/ping", (req, res) => {
    res.json({
      message: "Server is running!",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/demo", handleDemo);

  // Database health check
  app.get("/api/health", async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
      status: "ok",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  });

  // Scan History Routes
  app.post("/api/scans", createScan);
  app.get("/api/scans", getScanHistory);
  app.get("/api/scans/:id", getScanById);
  app.delete("/api/scans/:id", deleteScan);
  app.get("/api/analytics", getAnalytics);
  app.post("/api/analyze", analyzeMessage);

  // Social Media Analyzer Routes
  app.post("/api/social-media/analyze", analyzeSocialMediaContent);
  app.get("/api/social-media/analytics", getSocialMediaAnalytics);
  app.get("/api/social-media/history", getSocialMediaHistory);
  app.get("/api/social-media/analysis/:id", getSocialMediaAnalysisById);
  app.delete("/api/social-media/analysis/:id", deleteSocialMediaAnalysis);
  app.get("/api/social-media/export", exportSocialMediaReport);
  app.get("/api/social-media/health", socialMediaHealthCheck);

  // OTP Routes
  app.post("/api/otp/send", sendOTP);
  app.post("/api/otp/verify", verifyOTP);
  app.post("/api/otp/resend", resendOTP);
  app.get("/api/otp/status/:phoneNumber", getOTPStatus);

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const spaPath = join(__dirname, "../spa");
    app.use(express.static(spaPath));

    // Catch all handler for SPA
    app.get("*", (req, res) => {
      res.sendFile(join(spaPath, "index.html"));
    });
  }

  return app;
}

function startServer() {
  const app = createApp();
  const PORT = process.env.PORT || 8080;

  const server = createHttpServer(app);

  server.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    // Test database connection on startup
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn(
        "⚠️  Database connection failed. Check your DATABASE_URL environment variable.",
      );
      console.log(
        "You can still use the app with mock data, but real data storage is disabled.",
      );
    }
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
