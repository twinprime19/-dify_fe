'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import GoogleLoginButton from './GoogleLoginButton'
import MicrosoftLoginButton from './MicrosoftLoginButton'

export default function AuthButtons() {
  const { data: session, status } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)

  if (status === 'loading') {
    return (
      <button
        disabled
        className='px-4 py-2 text-sm opacity-50 cursor-not-allowed bg-gray-100 rounded'
      >
        <span className='animate-pulse'>Loading...</span>
      </button>
    )
  }

  if (session) {
    return (
      <div className='relative'>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className='flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50'
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user?.name || 'User'}
              className='w-6 h-6 rounded-full'
            />
          ) : (
            <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs'>
              {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
            </div>
          )}
          <span className='max-w-[150px] truncate'>
            {session.user?.name || session.user?.email || 'User'}
          </span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {showDropdown && (
          <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200'>
            <div className='px-4 py-2 text-sm text-gray-700 truncate border-b border-gray-100'>
              Signed in as
              <br />
              <span className='font-medium'>{session.user?.email}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50'
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='relative'>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
      >
        Sign in
      </button>

      {showDropdown && (
        <div className='absolute right-0 mt-2 bg-white rounded-md shadow-lg py-2 z-10 border border-gray-200 min-w-[220px]'>
          <div className='flex flex-col gap-2 p-2'>
            <MicrosoftLoginButton />
            <GoogleLoginButton />
          </div>
        </div>
      )}
    </div>
  )
}
