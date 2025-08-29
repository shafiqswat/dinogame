// services/youtubeAPI.js - minimal placeholder (no polling, optional API)
const logger = require('../utils/logger');
const config = require('../config/config');

class YouTubeAPI {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || config.YOUTUBE.API_KEY || '';
  }

  async initialize() {
    if (!this.apiKey) {
      logger.info('YouTube API key not provided - skipping channel polling.');
      return false;
    }
    // For simplicity we do not include googleapis integration in this minimal bundle.
    logger.info('YouTube API key present but googleapis integration omitted in minimal build.');
    return true;
  }
}

module.exports = YouTubeAPI;
