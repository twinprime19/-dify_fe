import { getLocaleOnServer } from '@/i18n/server'
import AuthProvider from './components/AuthProvider'

import './styles/globals.css'
import './styles/markdown.scss'

const LocaleLayout = ({ children }: { children: React.ReactNode }) => {
  const locale = getLocaleOnServer()
  return (
    <html lang={locale ?? 'en'} className='h-full antialiased'>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Modern AI Chat Interface - Powered by Next.js and Tailwind CSS" />
      </head>
      <body className='h-full font-sans'>
        <AuthProvider>
          <div className='overflow-x-auto min-h-screen'>
            <div className='w-screen h-screen min-w-[320px] relative'>
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

export default LocaleLayout
