# 🦖 StreamDino 24/7 - Chrome Dino Game Live Stream

A robust 24/7 live streaming system for the Chrome Dino game with auto-jump functionality, never-ending gameplay, and automated monitoring. Perfect for creating engaging content on YouTube Live.

## ✨ Features

- **🎮 Enhanced Chrome Dino Game**: Custom-built game with auto-jump and never-ending gameplay
- **📺 24/7 Live Streaming**: Automated streaming to YouTube with RTMP
- **🤖 Auto-Jump System**: Intelligent obstacle detection and automatic jumping
- **🔄 Auto-Restart**: Automatic stream recovery and game restart on failures
- **📊 Health Monitoring**: Real-time health checks and performance monitoring
- **🌐 Web Dashboard**: Live status monitoring and stream control
- **📱 Replit Optimized**: Built specifically for Replit deployment
- **🔧 UptimeRobot Ready**: Health check endpoints for external monitoring

## 🚀 Quick Start

### 1. Deploy to Replit

1. **Fork this repository** or create a new Replit project
2. **Import the code** into your Replit workspace
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set environment variables** in Replit:
   - `YOUTUBE_STREAM_KEY`: Your YouTube stream key
   - `YOUTUBE_STREAM_URL`: YouTube RTMP URL (usually `rtmp://a.rtmp.youtube.com/live2`)
   - `AUTO_START_STREAM`: Set to `true` for automatic streaming

### 2. Start Streaming

```bash
npm start
```

The application will automatically:
- Launch a headless browser with the Dino game
- Enable auto-jump functionality
- Start the game automatically
- Begin streaming to YouTube Live

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `YOUTUBE_STREAM_KEY` | Your YouTube stream key | Required |
| `YOUTUBE_STREAM_URL` | YouTube RTMP URL | `rtmp://a.rtmp.youtube.com/live2` |
| `AUTO_START_STREAM` | Auto-start stream on launch | `true` |
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Environment mode | `production` |

### YouTube Stream Setup

1. **Go to YouTube Studio** → Live Streaming
2. **Create a new stream** or use existing
3. **Copy the Stream Key** from the stream settings
4. **Set the environment variable** in Replit

## 📱 UptimeRobot Integration

### 1. Create UptimeRobot Account

1. Visit [UptimeRobot.com](https://uptimerobot.com/)
2. Sign up for a free account (50 monitors included)
3. Create a new monitor

### 2. Configure Monitor

- **Monitor Type**: HTTP(s)
- **URL**: `https://your-replit-url.repl.co/health`
- **Check Interval**: 5 minutes (free plan)
- **Alert Contacts**: Set up email/SMS notifications

### 3. Monitor Endpoints

- **Health Check**: `/health` - Overall system status
- **Stream Status**: `/api/status` - Live stream information
- **System Info**: `/api/system` - Server performance metrics

## 🎮 Game Features

### Auto-Jump System

The game automatically detects obstacles and jumps when:
- Cactus obstacles are within 150 pixels
- Bird obstacles are approaching
- Game speed increases over time

### Never-Ending Gameplay

- **No Game Over**: Collisions reset the dino position instead of ending the game
- **Progressive Difficulty**: Game speed increases over time
- **Score Persistence**: High scores are saved locally
- **Auto-Restart**: Game automatically restarts if it stops

### Controls

- **Space/Up Arrow**: Manual jump
- **Auto-Jump Button**: Toggle automatic jumping
- **Start/Pause**: Control game state
- **Reset**: Reset score and game state

## 🛠️ API Endpoints

### Health & Status

- `GET /health` - System health check
- `GET /api/status` - Stream status
- `GET /api/system` - System information

### Stream Control

- `POST /api/stream/start` - Start streaming
- `POST /api/stream/stop` - Stop streaming
- `POST /api/stream/restart` - Restart stream

### Media

- `GET /api/screenshot` - Capture game screenshot
- `GET /live` - Live game interface

## 📊 Monitoring & Maintenance

### Health Checks

The system performs automatic health checks every 30 seconds:
- Browser responsiveness
- Game state monitoring
- Stream status verification
- Auto-restart on failures

### Performance Metrics

- **Memory Usage**: Real-time memory consumption
- **Stream Uptime**: Continuous streaming duration
- **Restart Count**: Number of automatic restarts
- **System Resources**: CPU, memory, and load averages

### Troubleshooting

#### Common Issues

1. **Stream Won't Start**
   - Check YouTube stream key and URL
   - Verify Replit has sufficient resources
   - Check browser console for errors

2. **Game Not Responding**
   - Refresh the page at `/live`
   - Check auto-jump is enabled
   - Verify game canvas is visible

3. **High Memory Usage**
   - Restart the application
   - Check for memory leaks in browser
   - Monitor system resources

## 🔒 Security Considerations

- **Environment Variables**: Never commit stream keys to version control
- **Access Control**: Consider adding authentication for stream control endpoints
- **Rate Limiting**: Implement rate limiting for public endpoints
- **HTTPS**: Use HTTPS in production for secure communication

## 📈 Scaling & Optimization

### Replit Optimization

- **Resource Management**: Efficient memory usage for long-running streams
- **Process Monitoring**: Automatic restart on failures
- **Error Handling**: Graceful degradation and recovery

### Performance Tips

- **Browser Settings**: Optimized Chrome flags for streaming
- **FFmpeg Configuration**: Efficient video encoding settings
- **Memory Management**: Regular cleanup and garbage collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Chrome Dino Game**: Original game concept by Google
- **Replit**: Platform for easy deployment and hosting
- **UptimeRobot**: Reliable uptime monitoring service
- **FFmpeg**: Powerful multimedia framework for streaming

## 📞 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions
- **Documentation**: Check the docs folder for detailed guides

---

**Happy Streaming! 🎮📺**

*Built with ❤️ for the streaming community*
