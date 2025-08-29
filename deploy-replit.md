<!-- @format -->

# 🚀 Deploy StreamDino 24/7 to Modern Replit (2024)

This guide will walk you through deploying your StreamDino 24/7 application to the current version of Replit for 24/7 live streaming.

## 📋 Prerequisites

- [ ] Replit account (free)
- [ ] YouTube channel with live streaming enabled
- [ ] YouTube stream key
- [ ] Basic understanding of environment variables

## 🔧 Step 1: Access Modern Replit

1. **Go to [Replit.com](https://replit.com)**
2. **Sign in** to your account
3. **Click "Create"** button (or the "+" icon)
4. **Choose "Import code or design"** (this is the option for GitHub imports)

## 📁 Step 2: Import from GitHub

### Option A: Import from GitHub (Recommended)

1. **Click "Import code or design"**
2. **Select "Import from GitHub"**
3. **Enter your repository URL** (if you have the code on GitHub)
4. **Click "Import from GitHub"**
5. **Wait for import to complete**

### Option B: Start from Scratch

1. **Click "Create with AI"** (if you want AI-generated project)
2. **Or click "Start from scratch"** and select "Node.js"
3. **Name your project**: `streamdino-24-7`
4. **Click "Create"**

## 📁 Step 3: Set Up Project Structure (if starting from scratch)

If you didn't import from GitHub, you'll need to create the file structure:

1. **Right-click in the file explorer** → **"Add Folder"**
2. **Create these folders:**
   - `config`
   - `services`
   - `utils`
   - `public`

## 📁 Step 4: Upload All Project Files

Now let's add each file. **Right-click on each folder** and select **"Add File"**:

### **Root Level Files:**

- `package.json`
- `.replit`
- `app.js`
- `setup-replit.sh`
- `README.md`
- `UPTIMEROBOT_SETUP.md`
- `deploy-replit.md`

### **Config Folder:**

- `config.js`

### **Services Folder:**

- `enhancedStreamManager.js`

### **Utils Folder:**

- `logger.js`

### **Public Folder:**

- `dino-game.html`
- `health.html`

## ⚙️ Step 5: Install Dependencies

1. **Open the Shell** (bottom panel of Replit)
2. **Run this command:**
   ```bash
   npm install
   ```
3. **Wait for installation to complete** (you'll see a progress bar)

## 🔑 Step 6: Configure Environment Variables

1. **Click on "Tools"** in the left sidebar
2. **Select "Secrets"**
3. **Add these environment variables one by one:**

   | Key                  | Value                             | Description                 |
   | -------------------- | --------------------------------- | --------------------------- |
   | `YOUTUBE_STREAM_KEY` | `your_actual_stream_key`          | Your YouTube stream key     |
   | `YOUTUBE_STREAM_URL` | `rtmp://a.rtmp.youtube.com/live2` | YouTube RTMP URL            |
   | `AUTO_START_STREAM`  | `true`                            | Auto-start stream on launch |
   | `NODE_ENV`           | `production`                      | Production environment      |
   | `PORT`               | `5000`                            | Server port                 |

#### **How to Get Your YouTube Stream Key:**

1. **Go to [YouTube Studio](https://studio.youtube.com)**
2. **Click "Live Streaming"** in the left menu
3. **Click "Create Stream"** or use an existing one
4. **Go to "Stream Settings"**
5. **Copy the "Stream Key"** (it looks like: `abcd-efgh-ijkl-mnop`)

⚠️ **IMPORTANT**: Never share your stream key publicly!

## 🚀 Step 7: Start the Application

1. **Click the "Run" button** (green play button at the top)
2. **Wait for the application to start** (this may take 1-2 minutes)
3. **Watch the console output** for success messages

#### **Expected Console Output:**

```
🚀 Starting StreamDino 24/7 application...
Initializing Enhanced Stream Manager...
Enhanced Stream Manager initialized successfully
Game simulation started
🚀 StreamDino 24/7 server running on port 5000
📊 Health check: http://localhost:5000/health
🎮 Live game: http://localhost:5000/live
📺 Stream status: http://localhost:5000/api/status
Health monitoring started
UptimeRobot ping started
```

## 🧪 Step 8: Test Your Application

1. **Check the health endpoint:**

   - Your Replit URL will be shown in the top right
   - Visit: `https://your-replit-url.repl.co/health`
   - Should show: `{"status":"ok","streaming":false,...}`

2. **Test the game interface:**

   - Visit: `https://your-replit-url.repl.co/live`
   - Should show the Chrome Dino game
   - Click "Enable Auto-Jump" and "Start Game"

3. **Check stream status:**

   - Visit: `https://your-replit-url.repl.co/api/status`
   - Should show current stream status

## 📺 Step 9: Start Live Streaming

#### **Option A: Auto-Start (Recommended)**

If you set `AUTO_START_STREAM=true`, the stream will start automatically after 5 seconds.

#### **Option B: Manual Start**

1. **Visit the health check page** to verify everything is working
2. **Start streaming via API:**
   ```bash
   curl -X POST https://your-replit-url.repl.co/api/stream/start
   ```

## 🔍 Step 10: Monitor Your Stream

1. **Check YouTube Studio:**

   - Go to [YouTube Studio](https://studio.youtube.com)
   - Click "Live Streaming"
   - Your stream should appear as "Live"

2. **Monitor Replit Console:**

   - Watch for any error messages
   - Check memory usage
   - Monitor restart attempts

3. **Use Health Endpoints:**

   - `/health` - Overall system status
   - `/api/status` - Stream information
   - `/api/system` - Server performance

## 🚨 Step 11: Troubleshooting

### Common Issues:

**1. "Cannot find module" errors**

```bash
npm install
```

**2. Stream won't start**

- Check YouTube stream key
- Verify environment variables
- Check console for errors

**3. High memory usage**

- Restart the application
- Check for memory leaks
- Monitor system resources

### Debug Commands:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm list

# Check environment variables
echo $YOUTUBE_STREAM_KEY
```

## 📱 Step 12: Set Up UptimeRobot Monitoring

1. **Follow the [UptimeRobot Setup Guide](UPTIMEROBOT_SETUP.md)**
2. **Create monitors for:**
   - Health check: `/health`
   - Stream status: `/api/status`
   - Game interface: `/live`

## 🔄 Step 13: Keep It Running 24/7

### Replit Hibernation:

- **Free Repls** hibernate after 5 minutes of inactivity
- **Solution**: Use UptimeRobot to ping your health endpoint every 5 minutes

### Auto-Restart:

- The application automatically restarts on failures
- Health monitoring detects issues and restarts streams
- Maximum 5 restart attempts before stopping

## 📊 Step 14: Monitor Performance

### Key Metrics to Watch:

- **Memory Usage**: Should stay under 100MB
- **Stream Uptime**: Should continuously increase
- **Restart Count**: Should stay low
- **Response Time**: Should be under 5 seconds

### Performance Optimization:

- **Game Simulation**: Lightweight game state management
- **Memory Management**: Automatic cleanup
- **Error Handling**: Graceful degradation

## 🎯 Success Checklist

- [ ] Application starts without errors
- [ ] Health check returns `{"status":"ok"}`
- [ ] Game interface loads correctly
- [ ] Auto-jump functionality works
- [ ] Stream starts successfully
- [ ] YouTube shows live stream
- [ ] UptimeRobot monitoring active
- [ ] 24/7 operation confirmed

## 🆘 Getting Help

### Replit Support:

- [Replit Help](https://docs.replit.com/)
- [Replit Community](https://replit.com/community)

### StreamDino Issues:

- Check console logs
- Review error messages
- Test individual endpoints
- Restart application

### YouTube Issues:

- Verify stream key
- Check YouTube Studio
- Test with different stream key
- Contact YouTube support

## 🎉 Congratulations!

You've successfully deployed StreamDino 24/7 to Modern Replit! Your Chrome Dino game is now streaming 24/7 to YouTube Live with:

✅ **Automated gameplay** with auto-jump  
✅ **Never-ending gameplay** with collision recovery  
✅ **24/7 live streaming** to YouTube  
✅ **Automatic monitoring** and restart  
✅ **Health checks** for reliability  
✅ **UptimeRobot integration** for external monitoring  
✅ **No Puppeteer dependency** - better Replit compatibility

---

**Happy 24/7 Streaming! 🦖📺**

_Your Chrome Dino is now running forever on the internet!_
