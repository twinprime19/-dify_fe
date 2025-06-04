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
    ; (async () => {
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
        <div className='glass-effect p-8 rounded-3xl'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-primary-500'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-6 relative overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50'>
        <div className='absolute inset-0 opacity-30' style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <div className='absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-xl animate-float' />
      <div className='absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-accent-400/20 to-primary-400/20 rounded-full blur-xl animate-float' style={{ animationDelay: '2s' }} />
      <div className='absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-primary-300/20 to-accent-300/20 rounded-full blur-xl animate-float' style={{ animationDelay: '4s' }} />

      {/* Main Card */}
      <div className='relative z-10 w-full max-w-md space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg animate-pulse-glow'>
            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
          </div>
          <h1 className='text-3xl font-bold text-gradient-primary'>Welcome Back</h1>
          <p className='text-gray-600 font-medium'>
            Sign in to access your AI-powered workspace
          </p>
        </div>

        {/* Auth Card */}
        <div className='glass-effect p-8 rounded-3xl shadow-xl border border-white/30 backdrop-blur-xl space-y-8'>

          {/* Admin Login Form */}
          <div className='space-y-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-white/20'></div>
              </div>
              <div className='relative flex justify-center'>
                <span className='px-4 py-1.5 text-xs font-semibold text-gray-600 bg-white/80 rounded-full backdrop-blur-sm'>
                  Admin Access
                </span>
              </div>
            </div>

            <form onSubmit={handleCredentialLogin} className='space-y-6'>
              {error && (
                <div className='glass-effect p-4 rounded-2xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm'>
                  <div className='flex items-center space-x-2'>
                    <svg className='w-5 h-5 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <span className='text-red-700 text-sm font-medium'>{error}</span>
                  </div>
                </div>
              )}

              <div className='space-y-4'>
                <div>
                  <label htmlFor='username' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Username
                  </label>
                  <input
                    id='username'
                    name='username'
                    type='text'
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className='input-modern'
                    placeholder='Enter your username'
                  />
                </div>

                <div>
                  <label htmlFor='password' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Password
                  </label>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className='input-modern'
                    placeholder='Enter your password'
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='btn-primary w-full h-12 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white'></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1' />
                    </svg>
                    <span>Sign in as Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* SSO Providers */}
          {Object.values(providers).filter(provider => provider.id !== 'credentials').length > 0 && (
            <div className='space-y-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-white/20'></div>
                </div>
                <div className='relative flex justify-center'>
                  <span className='px-4 py-1.5 text-xs font-semibold text-gray-600 bg-white/80 rounded-full backdrop-blur-sm'>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className='space-y-3'>
                {Object.values(providers)
                  .filter(provider => provider.id !== 'credentials')
                  .map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => signIn(provider.id, { callbackUrl })}
                      className={`w-full flex items-center justify-center gap-3 h-12 rounded-2xl font-semibold transition-all duration-200 border ${provider.id === 'google'
                        ? 'bg-white/80 text-gray-700 border-gray-200/50 hover:bg-white hover:shadow-lg'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500/50 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
                        } backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      {provider.id === 'google' && (
                        <svg
                          viewBox='0 0 24 24'
                          width='20'
                          height='20'
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
                      )}
                      Sign in with {provider.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Development Bypass */}
          <div className='space-y-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-white/20'></div>
              </div>
              <div className='relative flex justify-center'>
                <span className='px-4 py-1.5 text-xs font-semibold text-gray-600 bg-white/80 rounded-full backdrop-blur-sm'>
                  Development Mode
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/chat?bypass=dev')}
              className='w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2'
            >
              <span>🚀</span>
              <span>Development Bypass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
