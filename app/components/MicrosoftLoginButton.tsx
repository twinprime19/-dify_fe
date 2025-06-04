'use client'

import { signIn } from 'next-auth/react'

export default function MicrosoftLoginButton() {
  return (
    <button
      onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
      className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
    >
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path fill='#ffffff' d='M11.4 24H0V12.6h11.4V24z' />
        <path fill='#ffffff' d='M24 24H12.6V12.6H24V24z' />
        <path fill='#ffffff' d='M11.4 11.4H0V0h11.4v11.4z' />
        <path fill='#ffffff' d='M24 11.4H12.6V0H24v11.4z' />
      </svg>
      Sign in with Microsoft
    </button>
  )
}
