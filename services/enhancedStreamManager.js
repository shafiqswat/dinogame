/** @format */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const config = require("../config/config");

class EnhancedStreamManager {
  constructor() {
    this.ffmpegProc = null;
    this.streaming = false;
    this.streamStartTime = null;
    this.restartAttempts = 0;
    this.maxRestartAttempts = 5;
    this.restartCooldown = 60000; // 1 minute
    this.lastRestartTime = 0;
    this.healthCheckInterval = null;
    this.gameCheckInterval = null;
    this.gameStats = {
      score: 0,
      highScore: 0,
      distance: 0,
      gameRunning: false,
      autoJump: true,
    };
  }

  async initialize() {
    try {
      logger.info("Initializing Enhanced Stream Manager...");

      // Start health monitoring
      this.startHealthMonitoring();

      // Start game simulation
      this.startGameSimulation();

      logger.info("Enhanced Stream Manager initialized successfully");
      return true;
    } catch (error) {
      logger.error(
        "Failed to initialize Enhanced Stream Manager:",
        error.message
      );
      return false;
    }
  }

  startGameSimulation() {
    // Simulate game running state
    this.gameStats.gameRunning = true;
    this.gameStats.autoJump = true;

    // Update game stats every second
    setInterval(() => {
      if (this.gameStats.gameRunning) {
        this.gameStats.score += 1;
        this.gameStats.distance += 0.1;

        if (this.gameStats.score > this.gameStats.highScore) {
          this.gameStats.highScore = this.gameStats.score;
        }
      }
    }, 1000);

    logger.info("Game simulation started");
  }

  async startStream() {
    try {
      if (this.streaming) {
        logger.info("Stream already running");
        return true;
      }

      const streamUrl =
        process.env.YOUTUBE_STREAM_URL || config.YOUTUBE.STREAM_URL || "";
      const streamKey =
        process.env.YOUTUBE_STREAM_KEY || config.YOUTUBE.STREAM_KEY || "";

      if (!streamUrl || !streamKey) {
        logger.warn("No YouTube RTMP configuration found. Streaming disabled.");
        return false;
      }

      const rtmp = `${streamUrl}/${streamKey}`;
      logger.info("Starting enhanced stream to:", rtmp);

      // Start screen capture and streaming
      const success = await this.startScreenCapture(rtmp);

      if (success) {
        this.streaming = true;
        this.streamStartTime = Date.now();
        this.restartAttempts = 0;
        logger.info("Enhanced stream started successfully");
        return true;
      } else {
        logger.error("Failed to start enhanced stream");
        return false;
      }
    } catch (error) {
      logger.error("Error starting enhanced stream:", error.message);
      return false;
    }
  }

  async startScreenCapture(rtmp) {
    try {
      // Use native ffmpeg command for test pattern streaming
      // This approach works reliably on Replit without complex dependencies
      const ffmpegArgs = [
        "-f",
        "lavfi",
        "-i",
        "testsrc2=size=1280x720:rate=30",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=1000:duration=1",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-b:v",
        "2500k",
        "-maxrate",
        "2500k",
        "-bufsize",
        "5000k",
        "-pix_fmt",
        "yuv420p",
        "-g",
        "60",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ar",
        "44100",
        "-f",
        "flv",
        rtmp,
      ];

      logger.info("Starting ffmpeg with test pattern for streaming...");

      // Start ffmpeg
      this.ffmpegProc = spawn("ffmpeg", ffmpegArgs, {
        stdio: ["ignore", "pipe", "pipe"],
      });

      // Monitor ffmpeg process
      this.ffmpegProc.stderr.on("data", (data) => {
        const output = data.toString();
        if (output.includes("error") || output.includes("Error")) {
          logger.error("FFmpeg error:", output.trim());
        } else if (output.includes("frame=")) {
          logger.debug("FFmpeg frame:", output.trim());
        }
      });

      this.ffmpegProc.on("exit", (code, signal) => {
        logger.warn(
          `FFmpeg process exited with code ${code} and signal ${signal}`
        );
        this.streaming = false;
        this.scheduleRestart();
      });

      this.ffmpegProc.on("error", (error) => {
        logger.error("FFmpeg process error:", error.message);
        this.streaming = false;
        this.scheduleRestart();
      });

      // Wait for ffmpeg to start successfully
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("FFmpeg startup timeout"));
        }, 10000);

        this.ffmpegProc.stderr.once("data", () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      return true;
    } catch (error) {
      logger.error("Failed to start screen capture:", error.message);
      return false;
    }
  }

  scheduleRestart() {
    const now = Date.now();
    if (now - this.lastRestartTime < this.restartCooldown) {
      logger.info("Restart cooldown active, skipping restart");
      return;
    }

    if (this.restartAttempts >= this.maxRestartAttempts) {
      logger.error("Max restart attempts reached, stopping stream");
      return;
    }

    this.restartAttempts++;
    this.lastRestartTime = now;

    logger.info(
      `Scheduling stream restart (attempt ${this.restartAttempts}/${this.maxRestartAttempts})`
    );

    setTimeout(async () => {
      logger.info("Attempting stream restart...");
      await this.restartStream();
    }, 5000);
  }

  async restartStream() {
    try {
      logger.info("Restarting stream...");

      // Stop current stream
      await this.stopStream();

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Restart stream
      const success = await this.startStream();

      if (success) {
        logger.info("Stream restart successful");
      } else {
        logger.error("Stream restart failed");
      }

      return success;
    } catch (error) {
      logger.error("Error during stream restart:", error.message);
      return false;
    }
  }

  startHealthMonitoring() {
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        if (!this.streaming) return;

        // Check stream uptime
        const uptime = Date.now() - this.streamStartTime;
        logger.info(`Stream uptime: ${Math.floor(uptime / 1000)}s`);

        // Simulate game health checks
        if (!this.gameStats.gameRunning) {
          logger.warn("Game stopped, restarting simulation...");
          this.gameStats.gameRunning = true;
          this.gameStats.score = 0;
        }

        if (!this.gameStats.autoJump) {
          logger.warn("Auto-jump disabled, re-enabling...");
          this.gameStats.autoJump = true;
        }
      } catch (error) {
        logger.error("Health check error:", error.message);
      }
    }, 30000);

    // Game check every 10 seconds
    this.gameCheckInterval = setInterval(async () => {
      try {
        if (!this.streaming) return;

        // Ensure game is running
        if (!this.gameStats.gameRunning) {
          this.gameStats.gameRunning = true;
        }

        // Ensure auto-jump is enabled
        if (!this.gameStats.autoJump) {
          this.gameStats.autoJump = true;
        }
      } catch (error) {
        logger.error("Game check error:", error.message);
      }
    }, 10000);
  }

  async stopStream() {
    try {
      logger.info("Stopping enhanced stream...");

      // Stop ffmpeg
      if (this.ffmpegProc) {
        this.ffmpegProc.kill("SIGTERM");
        this.ffmpegProc = null;
      }

      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      if (this.gameCheckInterval) {
        clearInterval(this.gameCheckInterval);
        this.gameCheckInterval = null;
      }

      this.streaming = false;
      this.streamStartTime = null;

      logger.info("Enhanced stream stopped");
      return true;
    } catch (error) {
      logger.error("Error stopping enhanced stream:", error.message);
      return false;
    }
  }

  async cleanup() {
    try {
      await this.stopStream();
      logger.info("Enhanced Stream Manager cleaned up");
    } catch (error) {
      logger.error("Error during cleanup:", error.message);
    }
  }

  getStreamStats() {
    return {
      streaming: this.streaming,
      streamStartTime: this.streamStartTime,
      uptime: this.streamStartTime ? Date.now() - this.streamStartTime : 0,
      restartAttempts: this.restartAttempts,
      maxRestartAttempts: this.maxRestartAttempts,
      gameStats: this.gameStats,
    };
  }

  getGameScreenshot() {
    // Return a simple status instead of screenshot
    return {
      status: "Game running",
      score: this.gameStats.score,
      highScore: this.gameStats.highScore,
      distance: this.gameStats.distance,
      autoJump: this.gameStats.autoJump,
    };
  }

  // Game control methods
  startGame() {
    this.gameStats.gameRunning = true;
    this.gameStats.score = 0;
    this.gameStats.distance = 0;
    logger.info("Game started");
  }

  stopGame() {
    this.gameStats.gameRunning = false;
    logger.info("Game stopped");
  }

  toggleAutoJump() {
    this.gameStats.autoJump = !this.gameStats.autoJump;
    logger.info(
      `Auto-jump ${this.gameStats.autoJump ? "enabled" : "disabled"}`
    );
    return this.gameStats.autoJump;
  }

  resetGame() {
    this.gameStats.score = 0;
    this.gameStats.distance = 0;
    this.gameStats.gameRunning = true;
    this.gameStats.autoJump = true;
    logger.info("Game reset");
  }
}

module.exports = EnhancedStreamManager;
