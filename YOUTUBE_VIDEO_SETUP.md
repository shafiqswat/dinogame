# YouTube Video Stream Setup

## Overview
This application has been updated to use YouTube embedded video URLs instead of local video files, solving GitHub push issues and enabling 24/7 streaming.

## Changes Made

### 1. Replaced Local Video with YouTube URL
- **Before**: Used local `stream.mp4` file in `public/` directory
- **After**: Uses YouTube video URL: `https://www.youtube.com/watch?v=d_nSworYRgY`

### 2. Simplified YouTube Integration
- Removed complex dependencies (no Python required)
- Uses embedded YouTube video in HTML page
- More reliable and compatible approach

### 3. Updated Configuration
- Added `YOUTUBE.VIDEO_URL` to config
- Environment variable support: `YOUTUBE_VIDEO_URL`
- Fallback to your provided video URL

### 4. Enhanced Stream Manager
- Modified `startScreenCapture()` to use YouTube URLs
- Added `getYouTubeStreamUrl()` method for URL extraction
- Improved error handling and fallback mechanisms

## Environment Variables

```bash
# Your YouTube video URL (default: your provided video)
YOUTUBE_VIDEO_URL=https://www.youtube.com/watch?v=d_nSworYRgY

# YouTube streaming credentials
YOUTUBE_STREAM_KEY=your_stream_key_here
YOUTUBE_STREAM_URL=rtmp://a.rtmp.youtube.com/live2

# Auto-start stream on application start
AUTO_START_STREAM=true
```

## Benefits

✅ **GitHub Safe**: No large video files to push  
✅ **24/7 Streaming**: Continuous video loop  
✅ **Easy Updates**: Change video by updating URL  
✅ **Better Quality**: Simplified approach with embedded video  
✅ **Reliable**: Fallback mechanisms included  

## Usage

1. **Set Environment Variables**:
   ```bash
   export YOUTUBE_VIDEO_URL="https://www.youtube.com/watch?v=d_nSworYRgY"
   export YOUTUBE_STREAM_KEY="your_stream_key"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Application**:
   ```bash
   npm start
   ```

4. **Access Web Interface**:
   - Open: `http://localhost:5000`
   - Use controls to start/stop/restart stream

## API Endpoints

- `GET /` - Web interface with video player
- `GET /health` - Health check for monitoring
- `GET /api/status` - Stream status
- `POST /api/stream/start` - Start streaming
- `POST /api/stream/stop` - Stop streaming
- `POST /api/stream/restart` - Restart streaming

## Troubleshooting

### Video Not Playing
- Check if YouTube video is public and accessible
- Verify internet connection
- Check if the HTML file exists: `public/youtube-stream.html`

### Stream Issues
- Verify YouTube stream key is correct
- Check RTMP URL configuration
- Monitor logs for FFmpeg errors

### Performance
- Video quality is limited to 720p for optimal streaming
- Adjust bitrate in config if needed
- Monitor system resources

## Your Video
The application is configured to use your YouTube video:
- **URL**: `https://www.youtube.com/watch?v=d_nSworYRgY`
- **Embed**: `https://www.youtube.com/embed/d_nSworYRgY`
- **Autoplay**: Enabled with loop for 24/7 streaming

This setup ensures your video streams continuously without requiring local file storage!
