# 🚀 Dify Web Application - Production Deployment Guide

This guide covers the complete production deployment of your Dify web application with Codex (OpenAI) integration using our automated deployment script.

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: 20GB+ available space
- **Network**: Public IP address with domain name (for SSL)

### Before Running the Script
1. **Domain Setup**: Point your domain DNS to your server's IP address
2. **API Keys**: Have your Dify and OpenAI API keys ready
3. **Root Access**: Ensure you have sudo/root access to the server

## 🔧 Quick Deployment

### Step 1: Prepare the Server

```bash
# Update system (if not done recently)
sudo apt update && sudo apt upgrade -y

# Download the deployment script
wget https://raw.githubusercontent.com/your-repo/dify-fe/main/setup-environment.sh
chmod +x setup-environment.sh
```

### Step 2: Set Environment Variables (Optional)

You can set these before running the script to avoid manual configuration:

```bash
# Required for production
export DOMAIN="yourdomain.com"
export PORT="3000"

# API Keys (recommended to set these)
export DIFY_APP_ID="your_dify_app_id"
export DIFY_APP_KEY="your_dify_app_key"
export OPENAI_API_KEY="sk-your_openai_api_key"

# Optional OAuth credentials
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"
export AZURE_AD_CLIENT_ID="your_azure_client_id"
export AZURE_AD_CLIENT_SECRET="your_azure_client_secret"
export AZURE_AD_TENANT_ID="your_azure_tenant_id"
```

### Step 3: Run the Deployment Script

```bash
sudo DOMAIN=yourdomain.com ./setup-environment.sh
```

The script will:
- ✅ Install all system dependencies (Node.js, Nginx, PM2, etc.)
- ✅ Set up the application directory (`/var/www/dify-webapp`)
- ✅ Install production dependencies
- ✅ Build the application
- ✅ Configure Nginx with security headers and caching
- ✅ Set up PM2 for process management
- ✅ Configure firewall (UFW)
- ✅ Optionally set up SSL certificates with Let's Encrypt

## 🔑 Post-Deployment Configuration

### Update Environment Variables

After deployment, edit the production environment file:

```bash
sudo nano /var/www/dify-webapp/.env.production
```

Update the following variables with your actual values:

```env
# Dify API Configuration (Required)
NEXT_PUBLIC_APP_ID=your_actual_dify_app_id
NEXT_PUBLIC_APP_KEY=your_actual_dify_app_key

# OpenAI/Codex Integration (Required)
OPENAI_API_KEY=sk-your_actual_openai_api_key
OPENAI_ORGANIZATION=org-your_openai_org_id

# Authentication (Update the secret)
NEXTAUTH_SECRET=your_secure_random_secret_32_chars_min

# OAuth Providers (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Restart the Application

After updating configuration:

```bash
sudo pm2 restart dify-webapp
```

## 🌐 SSL Certificate Setup

### Automatic Setup
The script will prompt you to set up SSL certificates automatically using Let's Encrypt.

### Manual Setup
If you skipped SSL setup during deployment:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Auto-Renewal
SSL auto-renewal is automatically configured in crontab.

## 🛠️ Management Commands

### Application Management
```bash
# Check application status
pm2 status

# View logs
pm2 logs dify-webapp

# Restart application
pm2 restart dify-webapp

# Monitor applications
pm2 monit

# Stop application
pm2 stop dify-webapp

# View detailed process info
pm2 show dify-webapp
```

### Nginx Management
```bash
# Check Nginx status
sudo systemctl status nginx

# Reload Nginx configuration
sudo systemctl reload nginx

# Test Nginx configuration
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### System Logs
```bash
# View application logs
sudo tail -f /var/log/dify-webapp/combined.log
sudo tail -f /var/log/dify-webapp/error.log

# View system logs
sudo journalctl -u nginx -f
sudo journalctl -f
```

## 🔄 Deployment Updates

### Code Updates
```bash
cd /var/www/dify-webapp

# Pull latest changes
sudo git pull origin main

# Install any new dependencies
sudo npm ci --only=production

# Rebuild application
sudo npm run build

# Restart application
sudo pm2 restart dify-webapp
```

### Zero-Downtime Deployment
```bash
# For zero-downtime updates
sudo pm2 reload dify-webapp
```

## 🔒 Security Considerations

### Firewall Configuration
The script automatically configures UFW firewall:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

### Security Headers
Nginx is configured with security headers:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content Security Policy

### File Permissions
- Application files owned by `www-data`
- Proper permissions set (755 for directories, 644 for files)

## 📊 Monitoring

### PM2 Monitoring
```bash
# Built-in monitoring
pm2 monit

# Web-based monitoring (optional)
pm2 web
```

### Log Monitoring
```bash
# Real-time log monitoring
pm2 logs --lines 200

# Application-specific logs
tail -f /var/log/dify-webapp/combined.log
```

## 🐛 Troubleshooting

### Common Issues

**1. Application won't start**
```bash
# Check logs
pm2 logs dify-webapp
sudo tail -f /var/log/dify-webapp/error.log

# Check environment variables
cat /var/www/dify-webapp/.env.production
```

**2. Nginx configuration errors**
```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**3. SSL certificate issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --dry-run
```

**4. Build failures**
```bash
# Check Node.js version
node --version

# Rebuild manually
cd /var/www/dify-webapp
sudo npm run build
```

### Performance Optimization

**1. PM2 Cluster Mode**
The deployment uses cluster mode by default (all CPU cores).

**2. Nginx Caching**
Static assets are cached with appropriate headers.

**3. Gzip Compression**
Enabled for all text-based content.

## 📞 Support

### Log Locations
- Application logs: `/var/log/dify-webapp/`
- Nginx logs: `/var/log/nginx/`
- PM2 logs: `~/.pm2/logs/`

### Configuration Files
- Application config: `/var/www/dify-webapp/.env.production`
- PM2 config: `/var/www/dify-webapp/ecosystem.config.js`
- Nginx config: `/etc/nginx/sites-available/dify-webapp`

### Useful Commands Summary
```bash
# Quick health check
pm2 status && sudo systemctl status nginx

# View all logs
pm2 logs && sudo tail /var/log/nginx/error.log

# Full restart
pm2 restart dify-webapp && sudo systemctl reload nginx

# Update and restart
cd /var/www/dify-webapp && sudo git pull && sudo npm run build && pm2 restart dify-webapp
```

---

🎉 **Your Dify application with Codex integration is now deployed and ready for production use!**

Access your application at `https://yourdomain.com` and use the default admin credentials:
- Username: `admin`
- Password: `password123!` 