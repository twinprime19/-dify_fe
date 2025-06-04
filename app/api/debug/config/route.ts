import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    APP_ID: process.env.NEXT_PUBLIC_APP_ID ? 'Set ✅' : 'Missing ❌',
    API_KEY: process.env.NEXT_PUBLIC_APP_KEY ? 'Set ✅' : 'Missing ❌',
    API_URL: process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL
      : 'Missing ❌',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set ✅' : 'Missing ❌',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL
      : 'Missing ❌',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json({
    message: 'Environment Configuration Debug',
    config,
    ready: !!(
      process.env.NEXT_PUBLIC_APP_ID &&
      process.env.NEXT_PUBLIC_APP_KEY &&
      process.env.NEXTAUTH_SECRET
    ),
  })
}
