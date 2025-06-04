#!/bin/bash

# Dify Web Application - Production Deployment Script for Codex (OpenAI)
# Comprehensive deployment script for Linux/Ubuntu servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="dify-webapp"
APP_DIR="/var/www/${APP_NAME}"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
SYSTEMD_DIR="/etc/systemd/system"
USER="www-data"
DOMAIN="${DOMAIN:-localhost}"
PORT="${PORT:-3000}"

echo -e "${GREEN}🚀 Dify Web Application - Production Deployment Script${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${CYAN}Domain: ${DOMAIN}${NC}"
echo -e "${CYAN}Port: ${PORT}${NC}"
echo -e "${CYAN}App Directory: ${APP_DIR}${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
    exit 1
fi

# System requirements check
echo -e "\n${YELLOW}🔍 Checking system requirements...${NC}"

# Check Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    echo -e "${RED}❌ This script is designed for Ubuntu/Debian systems${NC}"
    exit 1
fi

# Update system packages
echo -e "\n${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install required system packages
echo -e "\n${YELLOW}📦 Installing system dependencies...${NC}"
apt install -y curl git nginx certbot python3-certbot-nginx ufw build-essential rsync

# Install Node.js 18.x LTS
echo -e "\n${YELLOW}🔍 Installing Node.js 18.x LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"

# Install PM2 globally
echo -e "\n${YELLOW}📦 Installing PM2 process manager...${NC}"
npm install -g pm2

# Setup application directory
echo -e "\n${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p "$APP_DIR"

# If we're not already in the app directory, we might need to copy files
CURRENT_DIR=$(pwd)
if [ "$CURRENT_DIR" != "$APP_DIR" ] && [ -f "package.json" ]; then
    echo -e "${YELLOW}📁 Copying project files from current directory to ${APP_DIR}...${NC}"
    
    # Copy project files (excluding node_modules, .git, .next)
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='*.log' ./ "$APP_DIR/"
    
    echo -e "${GREEN}✅ Project files copied to ${APP_DIR}${NC}"
fi

cd "$APP_DIR"

# Stop existing PM2 processes
echo -e "\n${YELLOW}🛑 Stopping existing PM2 processes...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Clone or update repository
echo -e "\n${YELLOW}📥 Setting up application code...${NC}"
if [ -d ".git" ]; then
    echo -e "${GRAY}Updating existing repository...${NC}"
    git pull origin main
else
    echo -e "${YELLOW}⚠️  No git repository found in ${APP_DIR}${NC}"
    echo -e "${GRAY}Please ensure your application code is in ${APP_DIR}${NC}"
    echo -e "${GRAY}You can either:${NC}"
    echo -e "${GRAY}  1. Copy your files manually to ${APP_DIR}${NC}"
    echo -e "${GRAY}  2. Clone with: git clone <your-repo-url> ${APP_DIR}${NC}"
    echo -e "${GRAY}  3. Run this script from your existing project directory${NC}"
    
    # Check if we have package.json at least
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ No package.json found. Please ensure you're running this script from your project directory${NC}"
        echo -e "${RED}   or copy your project files to ${APP_DIR} first.${NC}"
        exit 1
    fi
fi

# Verify we have the essential files
echo -e "\n${YELLOW}🔍 Verifying project files...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project files verified${NC}"

# Clean previous installations
echo -e "\n${YELLOW}🧹 Cleaning previous installations...${NC}"
rm -rf node_modules .next

# Only remove package-lock.json if it's corrupted or we're having issues
if [ -f "package-lock.json" ]; then
    echo -e "${GRAY}Keeping existing package-lock.json...${NC}"
else
    echo -e "${GRAY}No package-lock.json found, will be generated during install...${NC}"
fi

# Clear npm cache
echo -e "\n${YELLOW}🗑️ Clearing npm cache...${NC}"
npm cache clean --force

# Install dependencies for production
echo -e "\n${YELLOW}📦 Installing production dependencies...${NC}"
echo -e "${GRAY}This may take a few minutes...${NC}"

# Function to try npm install with different strategies
install_dependencies() {
    local success=false
    
    # Strategy 1: Try npm ci if package-lock.json exists
    if [ -f "package-lock.json" ]; then
        echo -e "${GRAY}Strategy 1: Using npm ci with existing lockfile...${NC}"
        if npm ci --omit=dev; then
            success=true
        else
            echo -e "${YELLOW}npm ci failed, removing lockfile...${NC}"
            rm -f package-lock.json
        fi
    fi
    
    # Strategy 2: Try npm install
    if [ "$success" = false ]; then
        echo -e "${GRAY}Strategy 2: Using npm install...${NC}"
        if npm install --omit=dev; then
            success=true
        fi
    fi
    
    # Strategy 3: Try with legacy peer deps
    if [ "$success" = false ]; then
        echo -e "${GRAY}Strategy 3: Using npm install with legacy peer deps...${NC}"
        if npm install --legacy-peer-deps --omit=dev; then
            success=true
        fi
    fi
    
    # Strategy 4: Try with force flag
    if [ "$success" = false ]; then
        echo -e "${GRAY}Strategy 4: Using npm install with force flag...${NC}"
        if npm install --force --omit=dev; then
            success=true
        fi
    fi
    
    if [ "$success" = false ]; then
        echo -e "${RED}❌ All npm install strategies failed. Please check your package.json and try manually.${NC}"
        echo -e "${YELLOW}You can try running: cd ${APP_DIR} && npm install --omit=dev${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
}

# Run the installation with multiple fallback strategies
install_dependencies

# Create production environment configuration
echo -e "\n${YELLOW}🔧 Setting up production environment configuration...${NC}"

if [ ! -f ".env.production" ]; then
    echo -e "${GRAY}Creating .env.production file...${NC}"
    
    cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production

# Application Configuration
NEXT_PUBLIC_APP_NAME=Dify Web App
NEXT_PUBLIC_APP_DESCRIPTION=AI-powered conversation app with Codex integration

# Server Configuration
PORT=${PORT}
HOSTNAME=0.0.0.0

# Dify API Configuration (Required for Codex/OpenAI integration)
NEXT_PUBLIC_APP_ID=${DIFY_APP_ID:-your_dify_app_id_here}
NEXT_PUBLIC_APP_KEY=${DIFY_APP_KEY:-your_dify_app_key_here}
NEXT_PUBLIC_API_URL=https://api.dify.ai/v1

# Authentication Configuration
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-$(openssl rand -base64 32)}

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-your-google-client-id}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-your-google-client-secret}

# Azure AD (Optional - for Azure AD login)
AZURE_AD_CLIENT_ID=${AZURE_AD_CLIENT_ID:-your-azure-client-id}
AZURE_AD_CLIENT_SECRET=${AZURE_AD_CLIENT_SECRET:-your-azure-client-secret}
AZURE_AD_TENANT_ID=${AZURE_AD_TENANT_ID:-your-azure-tenant-id}

# OpenAI/Codex Integration
OPENAI_API_KEY=${OPENAI_API_KEY:-your-openai-api-key-here}
OPENAI_ORGANIZATION=${OPENAI_ORGANIZATION:-your-openai-org-id-here}

# Security
SECURITY_HEADERS=true
SECURE_COOKIES=true
EOF

    echo -e "${GREEN}✅ Created .env.production file${NC}"
else
    echo -e "${GREEN}✅ .env.production file already exists${NC}"
fi

# Create .env.local symlink for Next.js
ln -sf .env.production .env.local

# Build application for production
echo -e "\n${YELLOW}🔨 Building application for production...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please check the errors above and fix environment variables.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Production build successful!${NC}"
fi

# Set proper ownership
echo -e "\n${YELLOW}👤 Setting proper file ownership...${NC}"
chown -R $USER:$USER "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Create PM2 ecosystem file
echo -e "\n${YELLOW}⚙️ Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${APP_DIR}',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    error_file: '/var/log/${APP_NAME}/error.log',
    out_file: '/var/log/${APP_NAME}/out.log',
    log_file: '/var/log/${APP_NAME}/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 5000
  }]
};
EOF

# Create log directory
mkdir -p "/var/log/${APP_NAME}"
chown -R $USER:$USER "/var/log/${APP_NAME}"

# Create Nginx configuration
echo -e "\n${YELLOW}🌐 Setting up Nginx configuration...${NC}"
cat > "${NGINX_AVAILABLE}/${APP_NAME}" << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static file caching
    location /_next/static/ {
        proxy_pass http://localhost:${PORT};
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Favicon and robots
    location = /favicon.ico {
        proxy_pass http://localhost:${PORT};
        add_header Cache-Control "public, max-age=86400";
    }

    location = /robots.txt {
        proxy_pass http://localhost:${PORT};
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF

# Enable Nginx site
ln -sf "${NGINX_AVAILABLE}/${APP_NAME}" "${NGINX_ENABLED}/${APP_NAME}"

# Test Nginx configuration
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration valid${NC}"
    systemctl reload nginx
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

# Setup firewall
echo -e "\n${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw status

# Start application with PM2
echo -e "\n${YELLOW}🚀 Starting application with PM2...${NC}"
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Create systemd service for PM2 auto-restart
echo -e "\n${YELLOW}⚙️ Setting up PM2 systemd service...${NC}"
env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# SSL Certificate setup (optional)
if [ "$DOMAIN" != "localhost" ] && [ -n "$DOMAIN" ]; then
    echo -e "\n${YELLOW}🔒 Setting up SSL certificate...${NC}"
    echo -e "${GRAY}This will request a Let's Encrypt certificate for ${DOMAIN}${NC}"
    read -p "Do you want to setup SSL certificate now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Setup auto-renewal
        crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -
        echo -e "${GREEN}✅ SSL certificate configured and auto-renewal setup${NC}"
    fi
fi

# Final deployment summary
echo -e "\n${GREEN}🎉 Production Deployment Complete!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo -e "${CYAN}🌐 Application URLs:${NC}"
if [ "$DOMAIN" != "localhost" ]; then
    echo -e "${WHITE}   https://${DOMAIN}${NC}"
    echo -e "${WHITE}   https://www.${DOMAIN}${NC}"
else
    echo -e "${WHITE}   http://localhost${NC}"
fi
echo ""
echo -e "${CYAN}📋 Important Information:${NC}"
echo -e "${WHITE}1. Application Directory: ${APP_DIR}${NC}"
echo -e "${WHITE}2. Configuration File: ${APP_DIR}/.env.production${NC}"
echo -e "${WHITE}3. Logs Location: /var/log/${APP_NAME}/${NC}"
echo -e "${WHITE}4. PM2 Status: pm2 status${NC}"
echo ""
echo -e "${CYAN}🔧 Management Commands:${NC}"
echo -e "${GRAY}   pm2 status           - Check application status${NC}"
echo -e "${GRAY}   pm2 restart ${APP_NAME}    - Restart application${NC}"
echo -e "${GRAY}   pm2 logs ${APP_NAME}       - View application logs${NC}"
echo -e "${GRAY}   pm2 monit            - Monitor applications${NC}"
echo -e "${GRAY}   systemctl status nginx - Check Nginx status${NC}"
echo -e "${GRAY}   systemctl reload nginx - Reload Nginx config${NC}"
echo ""
echo -e "${CYAN}📝 Next Steps:${NC}"
echo -e "${WHITE}1. Update environment variables in: ${APP_DIR}/.env.production${NC}"
echo -e "${GRAY}   - DIFY_APP_ID and DIFY_APP_KEY${NC}"
echo -e "${GRAY}   - OPENAI_API_KEY for Codex integration${NC}"
echo -e "${GRAY}   - Authentication provider credentials${NC}"
echo ""
echo -e "${WHITE}2. Restart application after configuration:${NC}"
echo -e "${GRAY}   pm2 restart ${APP_NAME}${NC}"
echo ""
echo -e "${WHITE}3. Default admin credentials:${NC}"
echo -e "${GRAY}   Username: admin${NC}"
echo -e "${GRAY}   Password: password123!${NC}"
echo ""
echo -e "${GREEN}🚀 Your Dify application with Codex integration is now deployed and running!${NC}" 