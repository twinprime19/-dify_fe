import type { FC } from 'react'
import React, { useState, useEffect } from 'react'
import {
  Bars3Icon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid'
import { signOut, useSession } from 'next-auth/react'
import AppIcon from '@/app/components/base/app-icon'

export type IHeaderProps = {
  title: string
  isMobile?: boolean
  onShowSideBar?: () => void
  onCreateNewChat?: () => void
}

const Header: FC<IHeaderProps> = ({
  title,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
}) => {
  const { data: session } = useSession()
  const [isDevelopmentBypass, setIsDevelopmentBypass] = useState(false)

  useEffect(() => {
    const checkBypassMode = () => {
      const bypassCookie = document.cookie.includes('dev-bypass=true')
      setIsDevelopmentBypass(bypassCookie)
    }

    checkBypassMode()
    // Check periodically in case the cookie changes
    const interval = setInterval(checkBypassMode, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const handleBypassLogout = () => {
    // Clear the bypass cookie
    document.cookie =
      'dev-bypass=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;'
    // Redirect to signin
    window.location.href = '/auth/signin'
  }

  return (
    <div className='shrink-0 flex items-center justify-between h-16 px-6 glass-effect border-b border-white/20 backdrop-blur-xl'>
      {isMobile ? (
        <button
          className='flex items-center justify-center h-10 w-10 rounded-2xl hover:bg-white/10 transition-all duration-200 cursor-pointer group'
          onClick={() => onShowSideBar?.()}
        >
          <Bars3Icon className='h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors' />
        </button>
      ) : (
        <div className='w-10'></div>
      )}

      <div className='flex items-center space-x-3'>
        <AppIcon size='small' />
        <div className='flex items-center space-x-3'>
          <h1 className='text-lg font-bold text-gray-900 tracking-tight'>
            {title}
          </h1>
          {isDevelopmentBypass && (
            <span className='px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-lg animate-pulse-glow'>
              DEV MODE
            </span>
          )}
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        {isMobile ? (
          <button
            className='flex items-center justify-center h-10 w-10 rounded-2xl hover:bg-white/10 transition-all duration-200 cursor-pointer group'
            onClick={() => onCreateNewChat?.()}
          >
            <PencilSquareIcon className='h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors' />
          </button>
        ) : (
          <div className='w-10'></div>
        )}

        {(session || isDevelopmentBypass) && (
          <button
            className='flex items-center justify-center h-10 w-10 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer group'
            onClick={isDevelopmentBypass ? handleBypassLogout : handleLogout}
            title={isDevelopmentBypass ? 'Exit Dev Mode' : 'Logout'}
          >
            <ArrowRightOnRectangleIcon className='h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors' />
          </button>
        )}
      </div>
    </div>
  )
}

export default React.memo(Header)
