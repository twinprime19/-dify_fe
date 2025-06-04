# 🚀 Dify Web Application - Environment Setup Guide for Codex (OpenAI)

This guide will help you set up the Dify Web Application environment for seamless integration with Codex (OpenAI) and resolve the common issues you're experiencing.

## 🎯 Quick Fix for Your Current Issues

The errors you're seeing:
- ❌ `npm run lint (failed to run: next not found)`
- ❌ `npm run build (failed to run: next not found)`
- ❌ `npx tsc --noEmit (failed due to missing modules)`

These are caused by missing dependencies and incorrect environment setup. Our setup scripts will fix all of these!

## 🔧 Setup Scripts

We've created two environment setup scripts for you:

### For Windows PowerShell:
```powershell
.\setup-environment.ps1
```

### For Bash/WSL/Linux/macOS:
```bash
chmod +x setup-environment.sh
./setup-environment.sh
```

## 📋 What the Setup Scripts Do

1. **Environment Validation**
   - Checks Node.js version (requires >=18.0.0)
   - Validates npm installation
   - Ensures compatibility with project requirements

2. **Clean Installation**
   - Removes old `node_modules` and build artifacts
   - Clears npm cache
   - Fresh dependency installation with fallback to legacy peer deps

3. **Environment Configuration**
   - Creates `.env.local` with all required variables
   - Sets up Dify API configuration
   - Prepares OpenAI/Codex integration variables
   - Configures authentication settings

4. **Project Setup**
   - Installs all dependencies from `package.json`
   - Sets up Git hooks (husky)
   - Runs TypeScript type checking
   - Tests the build process

5. **Validation**
   - Verifies everything works correctly
   - Provides clear next steps and troubleshooting

## 🔑 Required API Keys

After running the setup script, you'll need to update `.env.local` with your actual API keys:

### Dify Configuration (Required)
```env
NEXT_PUBLIC_APP_ID=your_dify_app_id_here
NEXT_PUBLIC_APP_KEY=your_dify_app_key_here
NEXT_PUBLIC_API_URL=https://api.dify.ai/v1
```

### OpenAI/Codex Integration (Required for Codex)
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_ORGANIZATION=org-your-openai-org-id-here
```

### Authentication (Required)
```env
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-minimum-32-chars
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Getting Started

### Step 1: Run the Setup Script

**Windows (PowerShell):**
```powershell
# Navigate to your project directory
cd "E:\repos\-dify_fe"

# Run the setup script
.\setup-environment.ps1
```

**Bash/WSL:**
```bash
# Navigate to your project directory
cd /e/repos/-dify_fe

# Make script executable and run
chmod +x setup-environment.sh
./setup-environment.sh
```

### Step 2: Configure API Keys

1. Open `.env.local` in your favorite editor
2. Replace placeholder values with your actual API keys:
   - Get Dify API keys from your [Dify.ai dashboard](https://dify.ai/)
   - Get OpenAI API key from [OpenAI Platform](https://platform.openai.com/)

### Step 3: Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication

### Default Admin Access
- **Username**: `admin`
- **Password**: `password123!`

### Development Bypass
For testing without authentication:
- Add `?bypass=dev` to any URL
- Example: `http://localhost:3000?bypass=dev`

## 🛠️ Available Commands

After setup, you can use these commands:

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run type-check  # TypeScript type checking
```

## 🎨 Customization

### App Configuration
Edit `config/index.ts` to customize:
- App title and description
- Default language
- Prompt templates
- UI settings

### Environment Variables
Key environment variables for Codex integration:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_ID` | Dify application ID | Yes |
| `NEXT_PUBLIC_APP_KEY` | Dify API key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for Codex | Yes |
| `OPENAI_ORGANIZATION` | OpenAI organization ID | No |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |

## 🐛 Troubleshooting

### Common Issues and Solutions

**1. "next not found" error**
- ✅ Fixed by our setup script - ensures Next.js is properly installed

**2. "missing modules" TypeScript error**
- ✅ Fixed by our setup script - installs all dependencies and types

**3. Build failures**
- Check `.env.local` has correct API keys
- Ensure Node.js >= 18.0.0
- Run `npm install --legacy-peer-deps` if needed

**4. Authentication issues**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Use development bypass for testing: `?bypass=dev`

### Manual Troubleshooting Steps

If the setup script doesn't work:

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json .next

# 2. Clear npm cache
npm cache clean --force

# 3. Install with legacy peer deps
npm install --legacy-peer-deps

# 4. Check for TypeScript errors
npx tsc --noEmit

# 5. Try building
npm run build
```

## 📚 Additional Resources

- [Dify.ai Documentation](https://docs.dify.ai/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## 🤝 Support

If you encounter issues:

1. Check the console output from the setup script
2. Verify all API keys are correctly set in `.env.local`
3. Ensure Node.js version >= 18.0.0
4. Check the project's README.md for additional configuration

---

**Ready to integrate with Codex (OpenAI)!** 🎉

The setup scripts will get your environment ready for AI-powered development with the Dify platform and OpenAI Codex integration. 