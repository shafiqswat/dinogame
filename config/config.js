/** @format */

const path = require("path");

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,

  // YouTube streaming configuration
  YOUTUBE: {
    STREAM_KEY: process.env.YOUTUBE_STREAM_KEY || "dux5-je92-ktvv-3k6v-am9z",
    CHANNEL_ID: process.env.YOUTUBaE_CHANNEL_ID || "UCJ8WAUzgVUI5Hfpxf5GO1FA",
    USER_ID: process.env.YOUTUBE_USER_ID || "J8WAUzgVUI5Hfpxf5GO1FA",
    STREAM_URL:
      process.env.YOUTUBE_STREAM_URL || "rtmp://a.rtmp.youtube.com/live2",
    BACKUP_URL:
      process.env.YOUTUBE_BACKUP_URL ||
      "rtmp://b.rtmp.youtube.com/live2?backup=1",
    API_KEY:
      process.env.YOUTUBE_API_KEY || "AIzaSyCsxXI-J8h57tqx-VotHNGJDoam6FapppA",
  },

  // Game configuration
  GAME: {
    URL: "file:///home/runner/workspace/public/dino-game.html",
    WINDOW_WIDTH: 1280,
    WINDOW_HEIGHT: 720,
    AUTO_JUMP_THRESHOLD: 150, // Distance threshold for auto jump
    SCORE_CHECK_INTERVAL: 1000, // Check score every second
    RESTART_DELAY: 2000, // Wait before restarting after game over
  },

  // Stream configuration
  STREAM: {
    VIDEO_BITRATE: "2500k",
    AUDIO_BITRATE: "128k",
    FPS: 30,
    GOP_SIZE: 60,
    PRESET: "veryfast",
    PROFILE: "main",
    LEVEL: "3.1",
    PIXEL_FORMAT: "yuv420p",
  },

  // Overlay configuration
  OVERLAY: {
    FONT_FAMILY: "Arial, sans-serif",
    FONT_SIZE: 24,
    FONT_COLOR: "#FFFFFF",
    BACKGROUND_COLOR: "rgba(0, 0, 0, 0.7)",
    PADDING: 10,
    POSITION: {
      SUBSCRIBERS: { x: 20, y: 50 },
      SCORE: { x: 20, y: 100 },
      UPTIME: { x: 20, y: 150 },
    },
    UPDATE_INTERVAL: 5000, // Update overlay every 5 seconds
  },

  // Monitoring configuration
  MONITORING: {
    HEALTH_CHECK_INTERVAL: 30000,
    GAME_CHECK_INTERVAL: 10000,
    MAX_RESTART_ATTEMPTS: 5,
    RESTART_COOLDOWN: 60000,
  },

  // Logging configuration
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || "info",
    FILE_PATH: path.join(__dirname, "..", "logs"),
    MAX_FILE_SIZE: "10MB",
    MAX_FILES: 5,
  },

  // Browser configuration
  BROWSER: {
    HEADLESS: process.env.NODE_ENV === "production",
    ARGS: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  },
};
