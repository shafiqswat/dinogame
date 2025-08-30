/** @format */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const config = require("../config/config");
const ytdlp = require("yt-dlp-exec");

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

  async getYouTubeStreamUrl(youtubeUrl) {
    try {
      logger.info("Getting YouTube stream URL for:", youtubeUrl);
      
      // Use yt-dlp to get the best streaming URL
      const result = await ytdlp.exec(youtubeUrl, {
        dumpSingleJson: true,
        format: 'best[height<=720]', // Get best quality up to 720p
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
      });

      if (result && result.url) {
        logger.info("Successfully obtained YouTube stream URL");
        return result.url;
      } else {
        throw new Error("Failed to get stream URL from yt-dlp");
      }
    } catch (error) {
      logger.error("Error getting YouTube stream URL:", error.message);
      // Fallback to direct URL if yt-dlp fails
      return youtubeUrl;
    }
  }

  async startScreenCapture(rtmp) {
    try {
      // Use YouTube video URL instead of local file
      const youtubeVideoUrl = process.env.YOUTUBE_VIDEO_URL || 
        config.YOUTUBE.VIDEO_URL || "https://www.youtube.com/watch?v=d_nSworYRgY";
      
      logger.info("Using YouTube video URL:", youtubeVideoUrl);

      // Use yt-dlp to get the best streaming URL
      const streamUrl = await this.getYouTubeStreamUrl(youtubeVideoUrl);
      
      const ffmpegArgs = [
        "-re", // read input at native frame rate
        "-stream_loop",
        "-1", // loop indefinitely
        "-i",
        streamUrl,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        "2500k",
        "-maxrate",
        "2500k",
        "-bufsize",
        "5000k",
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

      logger.info("Starting ffmpeg to stream YouTube video");

      // Use bundled ffmpeg from @ffmpeg-installer/ffmpeg
      const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
      logger.info(`Using FFmpeg (installer) at: ${ffmpegPath}`);

      // Start ffmpeg
      this.ffmpegProc = spawn(ffmpegPath, ffmpegArgs, {
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
