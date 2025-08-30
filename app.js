/** @format */

const express = require("express");
const path = require("path");
const config = require("./config/config");
const EnhancedStreamManager = require("./services/enhancedStreamManager");
const logger = require("./utils/logger");

class StreamDino24_7 {
  constructor() {
    this.app = express();
    this.enhancedStreamManager = null;
    this.isStreaming = false;
    this.streamStartTime = null;
    this.healthCheckInterval = null;
    this.uptimeRobotPingInterval = null;

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, "public")));

    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint for UptimeRobot
    this.app.get("/health", (req, res) => {
      const uptime = process.uptime();
      const memory = process.memoryUsage();
      const streamStats = this.enhancedStreamManager
        ? this.enhancedStreamManager.getStreamStats()
        : {};

      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        uptimeFormatted: this.formatUptime(uptime),
        streaming: this.isStreaming,
        streamStartTime: this.streamStartTime,
        streamUptime: this.streamStartTime
          ? Math.floor((Date.now() - this.streamStartTime) / 1000)
          : 0,
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024) + "MB",
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + "MB",
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + "MB",
        },
        streamStats,
        version: "2.0.0",
        platform: process.platform,
        nodeVersion: process.version,
      });
    });

    // Main page
    this.app.get("/", (req, res) => {
      const indexPath = path.join(__dirname, "public", "index.html");
      if (require("fs").existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.json({
          status: "ok",
          message: "StreamDino 24/7 is running!",
          endpoints: {
            health: "/health",
            status: "/api/status",
            system: "/api/system",
          },
        });
      }
    });

    // Removed live game page - video-only streaming now

    // Stream status API
    this.app.get("/api/status", (req, res) => {
      const stats = this.enhancedStreamManager
        ? this.enhancedStreamManager.getStreamStats()
        : {};
      res.json({
        streaming: this.isStreaming,
        streamStartTime: this.streamStartTime,
        uptime: this.streamStartTime ? Date.now() - this.streamStartTime : 0,
        ...stats,
      });
    });

    // Stream control API
    this.app.post("/api/stream/start", async (req, res) => {
      try {
        if (this.isStreaming) {
          return res.json({
            success: false,
            message: "Stream already running",
          });
        }

        const success = await this.startStream();
        res.json({
          success,
          message: success ? "Stream started" : "Failed to start stream",
        });
      } catch (error) {
        logger.error("Error starting stream:", error.message);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    });

    this.app.post("/api/stream/stop", async (req, res) => {
      try {
        if (!this.isStreaming) {
          return res.json({ success: false, message: "No stream running" });
        }

        const success = await this.stopStream();
        res.json({
          success,
          message: success ? "Stream stopped" : "Failed to stop stream",
        });
      } catch (error) {
        logger.error("Error stopping stream:", error.message);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    });

    this.app.post("/api/stream/restart", async (req, res) => {
      try {
        const success = await this.restartStream();
        res.json({
          success,
          message: success ? "Stream restarted" : "Failed to restart stream",
        });
      } catch (error) {
        logger.error("Error restarting stream:", error.message);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    });

    // Removed screenshot endpoint - not needed for video-only streaming

    // System info endpoint
    this.app.get("/api/system", (req, res) => {
      const os = require("os");
      res.json({
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + "GB",
        freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + "GB",
        loadAverage: os.loadavg(),
        uptime: Math.floor(os.uptime()),
        hostname: os.hostname(),
      });
    });

    // FFmpeg test endpoint
    this.app.get("/api/test-ffmpeg", async (req, res) => {
      try {
        const { spawn } = require("child_process");
        const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

        logger.info("Testing FFmpeg installation...");

        const testProc = spawn(ffmpegPath, ["-version"], {
          stdio: ["ignore", "pipe", "pipe"],
        });

        let output = "";
        testProc.stdout.on("data", (data) => {
          output += data.toString();
        });

        testProc.stderr.on("data", (data) => {
          output += data.toString();
        });

        testProc.on("close", (code) => {
          if (code === 0) {
            res.json({
              success: true,
              message: "FFmpeg is working correctly",
              version: output.split("\n")[0],
              path: ffmpegPath,
            });
          } else {
            res.json({
              success: false,
              message: "FFmpeg test failed",
              code: code,
              output: output,
            });
          }
        });

        testProc.on("error", (error) => {
          res.json({
            success: false,
            message: "FFmpeg test error",
            error: error.message,
          });
        });
      } catch (error) {
        res.json({
          success: false,
          message: "FFmpeg test exception",
          error: error.message,
        });
      }
    });

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({ error: "Endpoint not found" });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error("Unhandled error:", error.message);
      res.status(500).json({ error: "Internal server error" });
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Received SIGINT, shutting down gracefully...");
      await this.shutdown();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM, shutting down gracefully...");
      await this.shutdown();
      process.exit(0);
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error.message);
      this.shutdown().then(() => process.exit(1));
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    });
  }

  async start() {
    try {
      logger.info("Starting StreamDino 24/7 application...");

      // Initialize enhanced stream manager
      this.enhancedStreamManager = new EnhancedStreamManager();
      const initialized = await this.enhancedStreamManager.initialize();

      if (!initialized) {
        logger.error("Failed to initialize Enhanced Stream Manager");
        process.exit(1);
      }

      // Start HTTP server
      const port = process.env.PORT || config.PORT || 5000;
      this.app.listen(port, "0.0.0.0", () => {
        logger.info(`🚀 StreamDino 24/7 server running on port ${port}`);
        logger.info(`📊 Health check: http://localhost:${port}/health`);
        logger.info(`🎮 Live game: http://localhost:${port}/live`);
        logger.info(`📺 Stream status: http://localhost:${port}/api/status`);
      });

      // Start health monitoring
      this.startHealthMonitoring();

      // Start UptimeRobot ping (if configured)
      this.startUptimeRobotPing();

      // Auto-start stream if environment variable is set
      if (process.env.AUTO_START_STREAM === "true") {
        logger.info("Auto-start stream enabled, starting stream...");
        setTimeout(() => this.startStream(), 5000);
      }
    } catch (error) {
      logger.error("Failed to start application:", error.message);
      process.exit(1);
    }
  }

  async startStream() {
    try {
      if (this.isStreaming) {
        logger.info("Stream already running");
        return true;
      }

      logger.info("Starting 24/7 Chrome Dino stream...");

      const success = await this.enhancedStreamManager.startStream();

      if (success) {
        this.isStreaming = true;
        this.streamStartTime = Date.now();
        logger.info("✅ Stream started successfully!");
        return true;
      } else {
        logger.error("❌ Failed to start stream");
        return false;
      }
    } catch (error) {
      logger.error("Error starting stream:", error.message);
      return false;
    }
  }

  async stopStream() {
    try {
      if (!this.isStreaming) {
        logger.info("No stream running");
        return true;
      }

      logger.info("Stopping stream...");

      const success = await this.enhancedStreamManager.stopStream();

      if (success) {
        this.isStreaming = false;
        this.streamStartTime = null;
        logger.info("✅ Stream stopped successfully");
        return true;
      } else {
        logger.error("❌ Failed to stop stream");
        return false;
      }
    } catch (error) {
      logger.error("Error stopping stream:", error.message);
      return false;
    }
  }

  async restartStream() {
    try {
      logger.info("Restarting stream...");

      await this.stopStream();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const success = await this.startStream();

      if (success) {
        logger.info("✅ Stream restarted successfully");
      } else {
        logger.error("❌ Failed to restart stream");
      }

      return success;
    } catch (error) {
      logger.error("Error restarting stream:", error.message);
      return false;
    }
  }

  startHealthMonitoring() {
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        if (!this.enhancedStreamManager) return;

        const stats = this.enhancedStreamManager.getStreamStats();
        const uptime = this.streamStartTime
          ? Date.now() - this.streamStartTime
          : 0;

        logger.info(
          `Health check - Stream: ${this.isStreaming}, Uptime: ${Math.floor(
            uptime / 1000
          )}s, Restarts: ${stats.restartAttempts}`
        );

        // Auto-restart if stream has been down for too long
        if (this.isStreaming && !stats.streaming && uptime > 300000) {
          // 5 minutes
          logger.warn("Stream appears to be down, attempting restart...");
          await this.restartStream();
        }
      } catch (error) {
        logger.error("Health check error:", error.message);
      }
    }, 30000);

    logger.info("Health monitoring started");
  }

  startUptimeRobotPing() {
    // Ping UptimeRobot every 5 minutes to keep the service alive
    this.uptimeRobotPingInterval = setInterval(async () => {
      try {
        // This is a simple ping to keep the service active
        // In production, you might want to ping your actual UptimeRobot endpoint
        logger.debug("UptimeRobot ping - service alive");
      } catch (error) {
        logger.error("UptimeRobot ping error:", error.message);
      }
    }, 300000); // 5 minutes

    logger.info("UptimeRobot ping started");
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  async shutdown() {
    try {
      logger.info("Shutting down StreamDino 24/7...");

      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      if (this.uptimeRobotPingInterval) {
        clearInterval(this.uptimeRobotPingInterval);
      }

      // Stop stream
      if (this.isStreaming) {
        await this.stopStream();
      }

      // Cleanup stream manager
      if (this.enhancedStreamManager) {
        await this.enhancedStreamManager.cleanup();
      }

      logger.info("Shutdown completed");
    } catch (error) {
      logger.error("Error during shutdown:", error.message);
    }
  }
}

// Start the application
if (require.main === module) {
  const app = new StreamDino24_7();
  app.start();
}

module.exports = StreamDino24_7;
