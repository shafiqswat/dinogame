<!-- @format -->

# 📱 UptimeRobot Setup Guide for StreamDino 24/7

This guide will help you set up UptimeRobot to monitor your StreamDino 24/7 application running on Replit.

## 🚀 Getting Started with UptimeRobot

### 1. Create UptimeRobot Account

1. Visit [UptimeRobot.com](https://uptimerobot.com/)
2. Click "Register for FREE"
3. Fill in your details and create account
4. Verify your email address

**Free Plan Features:**

- ✅ 50 monitors
- ✅ 5-minute check intervals
- ✅ Email notifications
- ✅ Basic status pages
- ✅ 20+ integrations

### 2. Access Your Dashboard

After logging in, you'll see your main dashboard with:

- Overview of all monitors
- Uptime statistics
- Recent alerts
- Quick actions

## 🔧 Setting Up Your First Monitor

### Step 1: Add New Monitor

1. Click the **"Add New Monitor"** button
2. Choose **"HTTP(s)"** as monitor type
3. Fill in the monitor details:

### Step 2: Monitor Configuration

**Basic Settings:**

- **Monitor Type**: HTTP(s)
- **Name**: `StreamDino 24/7 - Health Check`
- **URL**: `https://your-replit-url.repl.co/health`
- **Check Interval**: 5 minutes (free plan)
- **Timeout**: 30 seconds

**Advanced Settings:**

- **Alert When Down**: ✅ Enabled
- **Alert When Up**: ✅ Enabled
- **Alert When Paused**: ❌ Disabled

### Step 3: Alert Contacts

1. **Add Email Contact:**

   - Click "Add New Contact"
   - Choose "Email"
   - Enter your email address
   - Set alert threshold to 0 (immediate)

2. **Add SMS Contact (Optional):**
   - Choose "SMS"
   - Enter phone number
   - Verify with code

### Step 4: Save Monitor

Click "Create Monitor" to save your configuration.

## 📊 Multiple Monitor Setup

For comprehensive monitoring, create these additional monitors:

### 1. Health Check Monitor

```
Name: StreamDino Health
URL: /health
Purpose: Overall system health
```

### 2. Stream Status Monitor

```
Name: StreamDino Stream Status
URL: /api/status
Purpose: Live stream status
```

### 3. System Info Monitor

```
Name: StreamDino System
URL: /api/system
Purpose: Server performance
```

### 4. Game Interface Monitor

```
Name: StreamDino Game Interface
URL: /live
Purpose: Game accessibility
```

## 🔍 Understanding Monitor Responses

### Health Check Response (`/health`)

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "streaming": true,
  "streamUptime": 1800,
  "memory": {
    "rss": "45MB",
    "heapUsed": "25MB",
    "heapTotal": "30MB"
  }
}
```

**What to Monitor:**

- ✅ `status` should always be "ok"
- ✅ `streaming` should be true when active
- ✅ `memory.rss` should stay under 100MB
- ✅ `uptime` should continuously increase

### Stream Status Response (`/api/status`)

```json
{
  "streaming": true,
  "streamStartTime": 1704110400000,
  "uptime": 1800000,
  "restartAttempts": 0,
  "maxRestartAttempts": 5
}
```

**What to Monitor:**

- ✅ `streaming` should be true
- ✅ `restartAttempts` should stay low
- ✅ `uptime` should continuously increase

## 🚨 Setting Up Alerts

### 1. Alert Thresholds

**Immediate Alerts (Threshold: 0):**

- System goes down
- Stream stops
- High memory usage

**Delayed Alerts (Threshold: 1-2):**

- Intermittent failures
- Performance degradation

### 2. Alert Messages

**Customize your alert messages:**

**Down Alert:**

```
🚨 StreamDino 24/7 is DOWN!
URL: {{url}}
Time: {{datetime}}
Response: {{response}}
```

**Up Alert:**

```
✅ StreamDino 24/7 is back UP!
URL: {{url}}
Downtime: {{downtime}}
```

## 📱 Mobile App Setup

### 1. Download UptimeRobot App

- **iOS**: [App Store](https://apps.apple.com/app/uptimerobot/id449861514)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=com.uptimerobot.android)

### 2. Login and Configure

1. Open the app
2. Login with your UptimeRobot credentials
3. Enable push notifications
4. Customize alert settings

## 🔧 Advanced Monitoring

### 1. Keyword Monitoring

Monitor specific content in responses:

**Monitor for "streaming": true**

- **Monitor Type**: Keyword
- **URL**: `/api/status`
- **Keyword**: `"streaming": true`
- **Alert When**: Keyword not found

### 2. Response Time Monitoring

Track performance:

- **Monitor Type**: HTTP(s)
- **URL**: `/health`
- **Alert When**: Response time > 5 seconds

### 3. SSL Monitoring (if using HTTPS)

Monitor SSL certificate expiration:

- **Monitor Type**: SSL
- **URL**: Your Replit URL
- **Alert When**: Expires in 30 days

## 📊 Status Page Setup

### 1. Create Public Status Page

1. Go to **Status Pages** in UptimeRobot
2. Click **"Add New Status Page"**
3. Configure:
   - **Name**: "StreamDino 24/7 Status"
   - **URL**: Custom subdomain
   - **Monitors**: Select all StreamDino monitors

### 2. Customize Status Page

**Branding:**

- Upload your logo
- Choose color scheme
- Add custom CSS

**Content:**

- Add description
- Include contact information
- Add maintenance schedule

## 🔄 Integration with Other Services

### 1. Discord Integration

1. **Create Discord Webhook:**

   - Go to Discord channel settings
   - Integrations → Webhooks
   - Copy webhook URL

2. **Add to UptimeRobot:**
   - Go to My Settings → Integrations
   - Add Discord webhook
   - Configure alert preferences

### 2. Slack Integration

1. **Create Slack App:**

   - Go to [api.slack.com](https://api.slack.com)
   - Create new app
   - Add webhook URL

2. **Configure in UptimeRobot:**
   - Add Slack webhook
   - Set channel notifications

### 3. Email Integration

**Gmail Setup:**

- Enable 2-factor authentication
- Generate app password
- Use app password in UptimeRobot

## 📈 Monitoring Best Practices

### 1. Check Intervals

**Free Plan (5 minutes):**

- Health check: 5 minutes
- Stream status: 5 minutes
- System info: 10 minutes

**Paid Plans (1 minute):**

- Health check: 1 minute
- Stream status: 1 minute
- System info: 2 minutes

### 2. Alert Management

**Avoid Alert Fatigue:**

- Set appropriate thresholds
- Use different alert levels
- Group related alerts
- Schedule maintenance windows

### 3. Performance Tracking

**Monitor These Metrics:**

- Response time trends
- Uptime percentage
- Alert frequency
- False positive rate

## 🚨 Troubleshooting

### Common Issues

**1. Monitor Always Down**

- Check URL accessibility
- Verify Replit is running
- Check firewall settings
- Test with different devices

**2. False Positives**

- Increase timeout values
- Adjust check intervals
- Use keyword monitoring
- Check response patterns

**3. Missing Alerts**

- Verify contact settings
- Check alert thresholds
- Test notification delivery
- Review alert history

### Getting Help

**UptimeRobot Support:**

- Help Center: [help.uptimerobot.com](https://help.uptimerobot.com)
- Community Forum: [community.uptimerobot.com](https://community.uptimerobot.com)
- Email Support: Available on paid plans

## 📋 Checklist

- [ ] Create UptimeRobot account
- [ ] Set up health check monitor
- [ ] Configure stream status monitor
- [ ] Set up system info monitor
- [ ] Configure alert contacts
- [ ] Test alert delivery
- [ ] Set up mobile app
- [ ] Create status page
- [ ] Configure integrations
- [ ] Test monitoring system

## 🎯 Next Steps

1. **Start with basic monitoring** (health check)
2. **Add stream status monitoring**
3. **Configure alerts and notifications**
4. **Set up mobile app**
5. **Create public status page**
6. **Add advanced monitoring features**
7. **Integrate with other services**

---

**Happy Monitoring! 📱📊**

_Your StreamDino 24/7 will now be monitored 24/7!_
