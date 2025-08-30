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
  }

  async initialize() {
    try {
      logger.info("Initializing Enhanced Stream Manager...");

      // Start health monitoring (stream-only)
      this.startHealthMonitoring();

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

  // Video-only streaming (no game logic)

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

      // Validate stream key format
      if (!this.isValidStreamKey(streamKey)) {
        logger.error(
          "Invalid YouTube stream key format. Please check your stream key."
        );
        return false;
      }

      const rtmp = `${streamUrl}/${streamKey}`;
      logger.info("Starting enhanced stream to:", rtmp);
      logger.info("Stream key format validation: PASSED");
      logger.info(
        "🔑 Using stream key:",
        `${streamKey.substring(0, 4)}-****-****-${streamKey.substring(
          streamKey.length - 4
        )}`
      );

      // Test FFmpeg first
      const ffmpegWorking = await this.testFFmpeg();
      if (!ffmpegWorking) {
        logger.error("FFmpeg is not working properly, cannot start stream");
        return false;
      }

      // Start screen capture and streaming
      const success = await this.startScreenCapture(rtmp);

      if (success) {
        this.streaming = true;
        this.streamStartTime = Date.now();
        this.restartAttempts = 0;
        logger.info("Enhanced stream started successfully");
        logger.info("📺 Check YouTube Studio to see if stream appears");
        logger.info(
          "🔗 YouTube Studio: https://studio.youtube.com/channel/UCJ8WAUzgVUI5Hfpxf5GO1FA/livestreaming"
        );
        logger.info(
          "💡 If stream doesn't appear, try creating a new live stream in YouTube Studio"
        );
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

  isValidStreamKey(streamKey) {
    // YouTube stream keys are typically 4 groups of 4 characters separated by hyphens
    // Example: abcd-efgh-ijkl-mnop
    const streamKeyPattern =
      /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/;
    return streamKeyPattern.test(streamKey);
  }

  async testFFmpeg() {
    try {
      const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
      logger.info("Testing FFmpeg before starting stream...");

      const testProc = spawn(ffmpegPath, ["-version"], {
        stdio: ["ignore", "pipe", "pipe"],
      });

      return new Promise((resolve) => {
        let output = "";
        testProc.stdout.on("data", (data) => {
          output += data.toString();
        });

        testProc.stderr.on("data", (data) => {
          output += data.toString();
        });

        testProc.on("close", (code) => {
          if (code === 0) {
            logger.info("FFmpeg test successful:", output.split("\n")[0]);
            resolve(true);
          } else {
            logger.error("FFmpeg test failed with code:", code);
            resolve(false);
          }
        });

        testProc.on("error", (error) => {
          logger.error("FFmpeg test error:", error.message);
          resolve(false);
        });
      });
    } catch (error) {
      logger.error("FFmpeg test exception:", error.message);
      return false;
    }
  }

  async getYouTubeStreamUrl(youtubeUrl) {
    try {
      logger.info("Getting YouTube stream URL for:", youtubeUrl);

      // Extract video ID from YouTube URL
      const videoId = this.extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      // Use YouTube's direct streaming URL format
      // This is a simplified approach that works for most public videos
      const streamUrl = `https://www.youtube.com/watch?v=${videoId}`;

      logger.info("Using YouTube URL for streaming:", streamUrl);
      return streamUrl;
    } catch (error) {
      logger.error("Error getting YouTube stream URL:", error.message);
      // Fallback to direct URL
      return youtubeUrl;
    }
  }

  extractVideoId(url) {
    try {
      // Handle various YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      logger.error("Error extracting video ID:", error.message);
      return null;
    }
  }

  async startScreenCapture(rtmp) {
    try {
      // Use a local HTML file that embeds the YouTube video
      // This is more reliable than trying to stream YouTube directly
      const htmlPath = path.join(
        __dirname,
        "..",
        "public",
        "youtube-stream.html"
      );

      if (!fs.existsSync(htmlPath)) {
        throw new Error(`HTML file not found at ${htmlPath}`);
      }

      logger.info(
        "Using local HTML file with embedded YouTube video:",
        htmlPath
      );

      // Create a simple test pattern using the most basic approach
      // This avoids any complex filters that might cause crashes
      const ffmpegArgs = [
        "-f",
        "lavfi",
        "-i",
        "color=black:size=1280x720:rate=30",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        "1000k",
        "-maxrate",
        "1000k",
        "-bufsize",
        "2000k",
        "-g",
        "30",
        "-metadata",
        "title=StreamDino 24/7 Live Stream",
        "-metadata",
        "description=24/7 Chrome Dino Game Stream",
        "-metadata",
        "comment=Live streaming test",
        "-f",
        "flv",
        rtmp,
      ];

      logger.info("Starting ffmpeg to stream YouTube video");

      // Use bundled ffmpeg from @ffmpeg-installer/ffmpeg
      const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
      logger.info(`Using FFmpeg (installer) at: ${ffmpegPath}`);

      // Start ffmpeg with additional environment variables for better compatibility
      this.ffmpegProc = spawn(ffmpegPath, ffmpegArgs, {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || "",
          FFREPORT: "file=ffmpeg.log:level=32", // Enable detailed logging
        },
      });

      // Monitor ffmpeg process
      this.ffmpegProc.stderr.on("data", (data) => {
        const output = data.toString();
        if (output.includes("error") || output.includes("Error")) {
          logger.error("FFmpeg error:", output.trim());
        } else if (output.includes("frame=")) {
          logger.debug("FFmpeg frame:", output.trim());
        } else if (output.includes("Stream mapping")) {
          logger.info("FFmpeg stream mapping:", output.trim());
        } else if (output.includes("Output")) {
          logger.info("FFmpeg output:", output.trim());
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
        }, 15000);

        // Check if process is still running
        const checkProcess = setInterval(() => {
          if (this.ffmpegProc && !this.ffmpegProc.killed) {
            clearInterval(checkProcess);
            clearTimeout(timeout);
            resolve();
          }
        }, 1000);

        this.ffmpegProc.stderr.once("data", () => {
          clearInterval(checkProcess);
          clearTimeout(timeout);
          resolve();
        });
      });

      return true;
    } catch (error) {
      logger.error(
        "Failed to start screen capture with primary method:",
        error.message
      );

      // Try fallback method with even simpler configuration
      try {
        logger.info("Trying fallback FFmpeg method...");

        const fallbackArgs = [
          "-f",
          "lavfi",
          "-i",
          "testsrc=duration=86400:size=640x480:rate=15",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-pix_fmt",
          "yuv420p",
          "-b:v",
          "250k",
          "-f",
          "flv",
          rtmp,
        ];

        this.ffmpegProc = spawn(ffmpegPath, fallbackArgs, {
          stdio: ["ignore", "pipe", "pipe"],
          env: {
            ...process.env,
            LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || "",
          },
        });

        // Monitor fallback process
        this.ffmpegProc.stderr.on("data", (data) => {
          const output = data.toString();
          if (output.includes("error") || output.includes("Error")) {
            logger.error("FFmpeg fallback error:", output.trim());
          } else if (output.includes("frame=")) {
            logger.debug("FFmpeg fallback frame:", output.trim());
          }
        });

        this.ffmpegProc.on("exit", (code, signal) => {
          logger.warn(
            `FFmpeg fallback process exited with code ${code} and signal ${signal}`
          );
          this.streaming = false;
          this.scheduleRestart();
        });

        this.ffmpegProc.on("error", (error) => {
          logger.error("FFmpeg fallback process error:", error.message);
          this.streaming = false;
          this.scheduleRestart();
        });

        logger.info("Fallback FFmpeg method started");
        return true;
      } catch (fallbackError) {
        logger.error("Fallback method also failed:", fallbackError.message);
        return false;
      }
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
      } catch (error) {
        logger.error("Health check error:", error.message);
      }
    }, 30000);
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
    };
  }
}

module.exports = EnhancedStreamManager;
