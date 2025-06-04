'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function LoginButtons() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = (provider: string) => {
    setIsLoading(true)
    signIn(provider, { callbackUrl: '/' })
  }

  const handleSignOut = () => {
    setIsLoading(true)
    signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status])

  if (status === 'loading' || isLoading) {
    return (
      <div className='flex items-center justify-center h-12'>
        <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (session) {
    return (
      <div className='flex items-center gap-3'>
        <div className='text-sm text-gray-700 truncate max-w-[150px]'>
          {session.user?.email}
        </div>
        <button
          onClick={handleSignOut}
          className='px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition'
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-row gap-2'>
      <button
        onClick={() => handleSignIn('google')}
        className='px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition flex items-center justify-center gap-1.5'
      >
        <svg
          viewBox='0 0 24 24'
          width='16'
          height='16'
          xmlns='http://www.w3.org/2000/svg'
        >
          <g transform='matrix(1, 0, 0, 1, 27.009001, -39.238998)'>
            <path
              fill='#4285F4'
              d='M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z'
            />
            <path
              fill='#34A853'
              d='M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z'
            />
            <path
              fill='#FBBC05'
              d='M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z'
            />
            <path
              fill='#EA4335'
              d='M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z'
            />
          </g>
        </svg>
        Google
      </button>

      <button
        onClick={() => handleSignIn('azure-ad')}
        className='px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-1.5'
      >
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path fill='#ffffff' d='M11.4 24H0V12.6h11.4V24z' />
          <path fill='#ffffff' d='M24 24H12.6V12.6H24V24z' />
          <path fill='#ffffff' d='M11.4 11.4H0V0h11.4v11.4z' />
          <path fill='#ffffff' d='M24 11.4H12.6V0H24v11.4z' />
        </svg>
        Microsoft
      </button>
    </div>
  )
}
