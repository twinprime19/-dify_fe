'use client'

import { getProviders, signIn } from 'next-auth/react'
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type Provider = {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
    null
  )
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const res = await getProviders()
      setProviders(res)
    })()
  }, [])

  // Get callbackUrl from query parameters if available
  // Default to the main interface landing page (root)
  const [callbackUrl, setCallbackUrl] = useState('/')

  useEffect(() => {
    // Get the callback URL from the URL if present
    const searchParams = new URLSearchParams(window.location.search)
    const callback = searchParams.get('callbackUrl')
    if (callback) {
      // Use the provided callback URL
      setCallbackUrl(callback)
    }
    // Otherwise keep the default root URL
  }, [])

  const handleCredentialLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('Login attempt with:', { username })

    try {
      // Make sure we're explicitly using the credentials provider
      const result = await signIn('credentials', {
        username,
        password,
        redirect: true, // Change to true to let NextAuth handle redirects
        callbackUrl: '/', // Force redirect to root path
      })

      console.log('Sign in result:', result)

      // This code will only run if redirect:false
      if (result?.error) {
        console.error('Auth error:', result.error)
        setError(`Authentication failed: ${result.error}`)
      } else if (result?.ok) {
        console.log(
          'Login successful, NextAuth should handle redirect automatically'
        )
      } else {
        setError('Unexpected authentication result')
      }
    } catch (err) {
      console.error('Exception during login:', err)
      setError(
        `An error occurred during login: ${err instanceof Error ? err.message : String(err)}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!providers) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 bg-gray-50'>
      <div className='w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Sign in to your account</h1>
          <p className='mt-2 text-gray-600'>
            Choose your preferred sign-in method
          </p>
        </div>

        {/* Admin Login Form */}
        <div className='pt-4 pb-2'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>Admin Login</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleCredentialLogin} className='mt-2 space-y-4'>
          {error && (
            <div className='bg-red-50 text-red-600 p-3 rounded text-sm'>
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Username
            </label>
            <input
              id='username'
              name='username'
              type='text'
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter your username'
            />
          </div>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter your password'
            />
          </div>
          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex justify-center items-center'
            >
              {isLoading ? (
                <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2'></div>
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </div>
        </form>

        {/* SSO Providers Divider */}
        <div className='pt-4 pb-2'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>
                Or continue with
              </span>
            </div>
          </div>
        </div>

        {/* SSO Providers */}
        <div className='space-y-4'>
          {Object.values(providers)
            .filter(provider => provider.id !== 'credentials') // Don't show credentials provider button
            .map(provider => (
              <button
                key={provider.id}
                onClick={() => signIn(provider.id, { callbackUrl })}
                className={`w-full flex items-center justify-center gap-3 py-2.5 border rounded-md hover:bg-gray-50 transition ${
                  provider.id === 'google'
                    ? 'text-gray-700'
                    : 'text-white bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {provider.id === 'google' && (
                  <svg
                    viewBox='0 0 24 24'
                    width='24'
                    height='24'
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
                )}
                {provider.id === 'azure-ad' && (
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path fill='#ffffff' d='M11.4 24H0V12.6h11.4V24z' />
                    <path fill='#ffffff' d='M24 24H12.6V12.6H24V24z' />
                    <path fill='#ffffff' d='M11.4 11.4H0V0h11.4v11.4z' />
                    <path fill='#ffffff' d='M24 11.4H12.6V0H24v11.4z' />
                  </svg>
                )}
                Sign in with {provider.name}
              </button>
            ))}
        </div>

        {/* Development Bypass Button */}
        <div className='pt-4 pb-2'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>
                Development Mode
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/chat?bypass=dev')}
          className='w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200'
        >
          🚀 Bypass Login (Development)
        </button>
      </div>
    </div>
  )
}
