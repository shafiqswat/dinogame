/** @format */

// services/streamManager.js - simplified, robust static fallback streaming to YouTube RTMP
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const logger = require("../utils/logger");
const config = require("../config/config");

class StreamManager {
  constructor() {
    this.ffmpegProc = null;
    this.staticImage = path.join(os.tmpdir(), "stream_image.png");
    this.staticVideo = path.join(os.tmpdir(), "stream_content.mp4");
    this.silentAudio = path.join(os.tmpdir(), "silent_audio.wav");
    this.streaming = false;
  }

  async initialize() {
    // create silent audio if missing
    try {
      if (!fs.existsSync(this.silentAudio)) {
        // create 1s silent wav (simple header + zeros)
        const sampleRate = 44100,
          channels = 2,
          duration = 1,
          bps = 2;
        const dataSize = sampleRate * channels * duration * bps;
        const buf = Buffer.alloc(44 + dataSize);
        buf.write("RIFF", 0);
        buf.writeUInt32LE(buf.length - 8, 4);
        buf.write("WAVE", 8);
        buf.write("fmt ", 12);
        buf.writeUInt32LE(16, 16);
        buf.writeUInt16LE(1, 20);
        buf.writeUInt16LE(channels, 22);
        buf.writeUInt32LE(sampleRate, 24);
        buf.writeUInt32LE(sampleRate * channels * bps, 28);
        buf.writeUInt16LE(channels * bps, 32);
        buf.writeUInt16LE(16, 34);
        buf.write("data", 36);
        buf.writeUInt32LE(dataSize, 40);
        fs.writeFileSync(this.silentAudio, buf);
        logger.info("Created silent audio at", this.silentAudio);
      } else {
        logger.info("Using existing silent audio:", this.silentAudio);
      }
    } catch (e) {
      logger.warn(
        "Failed to create silent audio:",
        e && e.message ? e.message : e
      );
    }

    // write a small black PNG if missing (very small file)
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49l1bAAAACXBIWXMAAAsTAAALEwEAmpwYAAABH0lEQVR4nO2XwU3DMBRFn8p0mYgk6g/J2E7iBtkE3iA1gF7gG4Qx3iAZsQ1kR7g0sH0d0VX3V2s7u9u2b2mZs0gkQw5d0GQ3l3e6z6qqYy0gM8wFJwB+uQeKZg+S3cD3r+Y5uAicQ2Yh0qlFv2qgk4u4n0qk0D6aG7QnzWv4s3oK9q7gF9A7R8f8sXgO2g0bQ5kP3cLzQnq2o8lM5g5u8sY5c6B+gC2wM/j7s7JYw7oxk0d8g1wq5e6wH8h3t0n7vQH+0o3gq0QJ+qXjQwQwG3k6s0t3r7o4Q4sZk0Qy4Y9wL+0wGx3Yw2Qf1YQJv2Pd+6YI3rG0t+Q9wAAAABJRU5ErkJggg==";
    try {
      if (!fs.existsSync(this.staticImage)) {
        fs.writeFileSync(this.staticImage, Buffer.from(pngBase64, "base64"));
        logger.info("Wrote fallback static image to", this.staticImage);
      } else {
        logger.info("Using existing static image at", this.staticImage);
      }
    } catch (e) {
      logger.warn(
        "Failed to write static image:",
        e && e.message ? e.message : e
      );
    }

    return true;
  }

  async createStaticVideoIfMissing() {
    if (fs.existsSync(this.staticVideo)) {
      logger.info("Static video already present:", this.staticVideo);
      return this.staticVideo;
    }

    // Build an ffmpeg command to make a simple 10s mp4 from image + silent audio.
    // Command: ffmpeg -y -loop 1 -i image.png -i silent.wav -c:v libx264 -t 10 -pix_fmt yuv420p -c:a aac -shortest out.mp4
    const args = [
      "-y",
      "-loop",
      "1",
      "-i",
      this.staticImage,
      "-i",
      this.silentAudio,
      "-c:v",
      "libx264",
      "-t",
      "10",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-shortest",
      this.staticVideo,
    ];

    logger.info(
      "Creating static video with ffmpeg (this may take a few seconds)..."
    );
    return new Promise((resolve, reject) => {
      const ff = spawn("ffmpeg", args);
      let stderr = "";
      const timeout = setTimeout(() => {
        stderr += "\\nFFMPEG_TIMEOUT";
        try {
          ff.kill("SIGKILL");
        } catch (e) {}
        reject(new Error("ffmpeg timed out: " + stderr));
      }, 25000);

      ff.stderr.on("data", (d) => {
        stderr += d.toString();
        // keep stderr from flooding main logs
        // logger.debug('ffmpeg:', d.toString());
      });
      ff.on("exit", (code) => {
        clearTimeout(timeout);
        if (code === 0 && fs.existsSync(this.staticVideo)) {
          logger.info("Static video created at", this.staticVideo);
          resolve(this.staticVideo);
        } else {
          reject(new Error("ffmpeg failed (exit " + code + "): " + stderr));
        }
      });
      ff.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  async startStream() {
    try {
      const streamUrl = (
        process.env.YOUTUBE_STREAM_URL ||
        config.YOUTUBE.STREAM_URL ||
        ""
      ).trim();
      const streamKey = (
        process.env.YOUTUBE_STREAM_KEY ||
        config.YOUTUBE.STREAM_KEY ||
        ""
      ).trim();
      if (!streamUrl || !streamKey) {
        logger.warn(
          "No YouTube RTMP configuration found (YOUTUBE_STREAM_URL/YOUTUBE_STREAM_KEY). Streaming disabled."
        );
        return false;
      }
      const rtmp = `${streamUrl}/${streamKey}`;

      // Ensure static video exists
      await this.createStaticVideoIfMissing();

      // Spawn ffmpeg to stream the video in loop to RTMP
      // Command: ffmpeg -re -stream_loop -1 -i static.mp4 -c:v copy -c:a copy -f flv rtmp://...
      const args = [
        "-re",
        "-stream_loop",
        "-1",
        "-i",
        this.staticVideo,
        "-c:v",
        "copy",
        "-c:a",
        "copy",
        "-f",
        "flv",
        rtmp,
      ];

      logger.info("Starting ffmpeg push to RTMP:", rtmp);
      this.ffmpegProc = spawn("ffmpeg", args, {
        stdio: ["ignore", "pipe", "pipe"],
      });

      this.ffmpegProc.stderr.on("data", (d) => {
        const s = d.toString();
        // Only log important lines
        if (
          s.toLowerCase().includes("error") ||
          s.toLowerCase().includes("frame") ||
          s.toLowerCase().includes("bitrate")
        ) {
          logger.info("ffmpeg:", s.trim());
        }
      });

      this.ffmpegProc.on("exit", (code, sig) => {
        logger.warn("ffmpeg push exited code=" + code + " sig=" + sig);
        this.streaming = false;
      });

      this.streaming = true;
      return true;
    } catch (err) {
      logger.error(
        "startStream failed:",
        err && err.message ? err.message : err
      );
      return false;
    }
  }

  getStreamStats() {
    return {
      streaming: this.streaming,
      staticVideo: this.staticVideo,
      staticImage: this.staticImage,
    };
  }

  async stop() {
    try {
      if (this.ffmpegProc) {
        try {
          this.ffmpegProc.kill("SIGTERM");
        } catch (e) {}
        this.ffmpegProc = null;
      }
      this.streaming = false;
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = StreamManager;
