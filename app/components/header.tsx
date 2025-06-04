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
    <div className='shrink-0 flex items-center justify-between h-12 px-3 bg-gray-100'>
      {isMobile ? (
        <div
          className='flex items-center justify-center h-8 w-8 cursor-pointer'
          onClick={() => onShowSideBar?.()}
        >
          <Bars3Icon className='h-4 w-4 text-gray-500' />
        </div>
      ) : (
        <div></div>
      )}
      <div className='flex items-center space-x-2'>
        <AppIcon size='small' />
        <div className=' text-sm text-gray-800 font-bold'>
          {title}
          {isDevelopmentBypass && (
            <span className='ml-2 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded'>
              DEV MODE
            </span>
          )}
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        {isMobile ? (
          <div
            className='flex items-center justify-center h-8 w-8 cursor-pointer'
            onClick={() => onCreateNewChat?.()}
          >
            <PencilSquareIcon className='h-4 w-4 text-gray-500' />
          </div>
        ) : (
          <div></div>
        )}
        {(session || isDevelopmentBypass) && (
          <div
            className='flex items-center justify-center h-8 w-8 cursor-pointer'
            onClick={isDevelopmentBypass ? handleBypassLogout : handleLogout}
            title={isDevelopmentBypass ? 'Exit Dev Mode' : 'Logout'}
          >
            <ArrowRightOnRectangleIcon className='h-4 w-4 text-gray-500 hover:text-gray-700' />
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(Header)
