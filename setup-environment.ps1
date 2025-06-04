# Dify Web Application - Environment Setup Script for Codex (OpenAI)
# PowerShell script for Windows setup

Write-Host "🚀 Setting up Dify Web Application Environment for Codex (OpenAI)" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`n🔍 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    
    # Check if version meets requirements (>=18.0.0)
    $version = [System.Version]($nodeVersion -replace 'v', '')
    $requiredVersion = [System.Version]"18.0.0"
    
    if ($version -lt $requiredVersion) {
        Write-Host "❌ Node.js version $nodeVersion is too old. Please upgrade to Node.js 18.0.0 or later." -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Blue
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18.0.0 or later." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Blue
    exit 1
}

# Check npm version
Write-Host "`n🔍 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm." -ForegroundColor Red
    exit 1
}

# Clean previous installations if they exist
Write-Host "`n🧹 Cleaning previous installations..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Removing existing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

if (Test-Path "package-lock.json") {
    Write-Host "Removing existing package-lock.json..." -ForegroundColor Gray
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

if (Test-Path ".next") {
    Write-Host "Removing existing .next build..." -ForegroundColor Gray
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}

# Clear npm cache
Write-Host "`n🗑️ Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies. Trying with legacy peer deps..." -ForegroundColor Red
    npm install --legacy-peer-deps
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies even with legacy peer deps. Please check your internet connection and try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Create .env.local file if it doesn't exist
Write-Host "`n🔧 Setting up environment configuration..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Gray
    
    $envContent = @"
# Dify API Configuration (Required for Codex/OpenAI integration)
NEXT_PUBLIC_APP_ID=your_dify_app_id_here
NEXT_PUBLIC_APP_KEY=your_dify_app_key_here
NEXT_PUBLIC_API_URL=https://api.dify.ai/v1

# Authentication Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-minimum-32-chars

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Azure AD (Optional - for Azure AD login)
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id

# Development Mode (Set to true for development)
NODE_ENV=development

# OpenAI/Codex Integration (if using direct OpenAI API)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_ORGANIZATION=your-openai-org-id-here

# Additional configurations
NEXT_PUBLIC_APP_NAME=Dify Web App
NEXT_PUBLIC_APP_DESCRIPTION=AI-powered conversation app with Codex integration
"@

    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Created .env.local file with default configuration" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local file already exists" -ForegroundColor Green
}

# Setup husky hooks
Write-Host "`n🪝 Setting up Git hooks..." -ForegroundColor Yellow
if (Test-Path ".git") {
    npm run prepare
    Write-Host "✅ Git hooks configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git repository not found. Skipping Git hooks setup." -ForegroundColor Yellow
}

# Run type checking
Write-Host "`n🔍 Running TypeScript type checking..." -ForegroundColor Yellow
npx tsc --noEmit

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  TypeScript type checking found some issues, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "✅ TypeScript type checking passed!" -ForegroundColor Green
}

# Test build
Write-Host "`n🔨 Testing build process..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Missing environment variables in .env.local" -ForegroundColor Gray
    Write-Host "  - TypeScript errors that need to be fixed" -ForegroundColor Gray
    Write-Host "  - Missing dependencies" -ForegroundColor Gray
} else {
    Write-Host "✅ Build successful!" -ForegroundColor Green
}

# Final setup summary
Write-Host "`n🎉 Environment Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your actual API keys:" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_APP_ID (from Dify.ai)" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_APP_KEY (from Dify.ai)" -ForegroundColor Gray
Write-Host "   - OPENAI_API_KEY (from OpenAI for Codex)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Default admin credentials:" -ForegroundColor White
Write-Host "   - Username: admin" -ForegroundColor Gray
Write-Host "   - Password: password123!" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open your browser to:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "5. For development bypass (testing):" -ForegroundColor White
Write-Host "   Add ?bypass=dev to any URL" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Available Commands:" -ForegroundColor Cyan
Write-Host "   npm run dev      - Start development server" -ForegroundColor Gray
Write-Host "   npm run build    - Build for production" -ForegroundColor Gray
Write-Host "   npm run start    - Start production server" -ForegroundColor Gray
Write-Host "   npm run lint     - Run ESLint" -ForegroundColor Gray
Write-Host "   npm run type-check - Run TypeScript checking" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   - Check README.md for detailed configuration" -ForegroundColor Gray
Write-Host "   - Edit config/index.ts for app customization" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Ready for Codex (OpenAI) integration!" -ForegroundColor Green 