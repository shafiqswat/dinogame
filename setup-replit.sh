#!/bin/bash

echo "🚀 Setting up StreamDino 24/7 for Modern Replit (No Puppeteer)..."

# Update package lists
echo "📦 Updating package lists..."
sudo apt-get update

# Install system dependencies (minimal requirements)
echo "🔧 Installing system dependencies..."
sudo apt-get install -y \
    ffmpeg \
    curl \
    wget

# Install Node.js dependencies
echo "📚 Installing Node.js dependencies..."
npm install

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p screenshots

# Set permissions
echo "🔐 Setting permissions..."
chmod +x app.js
chmod +x setup-replit.sh

# Create environment file template
echo "⚙️ Creating environment template..."
cat > .env.template << EOF
# YouTube Streaming Configuration
YOUTUBE_STREAM_KEY=your_stream_key_here
YOUTUBE_STREAM_URL=rtmp://a.rtmp.youtube.com/live2
AUTO_START_STREAM=true

# Server Configuration
PORT=5000
NODE_ENV=production

# Logging
LOG_LEVEL=info
EOF

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set your YouTube stream key in Replit environment variables"
echo "2. Run 'npm start' to start the application"
echo "3. Visit /health to check system status"
echo "4. Visit /live to see the game interface"
echo ""
echo "🔗 Useful URLs:"
echo "- Health Check: /health"
echo "- Live Game: /live"
echo "- Stream Status: /api/status"
echo "- System Info: /api/system"
echo ""
echo "🎮 Happy streaming!"
echo ""
echo "💡 Note: This version uses game simulation instead of Puppeteer for better Replit compatibility"
