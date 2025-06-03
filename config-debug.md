# Configuration Debug Guide

## Issue: "App is unavailable" Error

This error occurs when the required environment variables are not properly set.

## Required Environment Variables

Create a `.env.local` file in your project root with these variables:

```env
# Required App Configuration
NEXT_PUBLIC_APP_ID=your_app_id_here
NEXT_PUBLIC_APP_KEY=your_api_key_here
NEXT_PUBLIC_API_URL=http://172.16.20.1/v1

# Required Authentication Configuration
NEXTAUTH_SECRET=your-random-secret-string-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Troubleshooting Steps

1. **Check if .env.local exists** in your project root
2. **Verify variable names** - they must start with `NEXT_PUBLIC_` for client-side access
3. **No quotes needed** around values in .env files
4. **No spaces** around the = sign
5. **Restart your development server** after making changes

## Fixed Issues

- ✅ Fixed environment variable string interpolation that was converting undefined to "undefined"
- ✅ Added proper validation for empty and invalid environment variables
- ✅ Added debug logging to console to show configuration status

## Debug Information

Check your browser console for debug information showing:
- Which environment variables are set
- Whether the configuration validation passes
- Any missing required values

## Development Bypass

For testing without authentication, you can use the development bypass:
- Go to `/auth/signin`
- Click "🚀 Bypass Login (Development)"
- This bypasses authentication but still requires environment variables for the app functionality 