import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'
import './styles/markdown.scss'
import { APP_INFO } from '@/config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: APP_INFO?.title || 'Chat App',
  description: 'AI Chat Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  )
}
