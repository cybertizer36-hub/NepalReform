'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { MessageCircle, X, LogIn } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

// Configuration
const CHATBOT_URL = process.env.NEXT_PUBLIC_CHATBOT_URL || 'https://chat.nepalreforms.com/?embedded=true'
const CHATBOT_TITLE = process.env.NEXT_PUBLIC_CHATBOT_TITLE || 'Nepal Reforms Assistant'

const FloatingChatWidget: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Toggle chat window
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev)
    // Only load iframe if user is authenticated
    if (!isOpen && !isLoaded && user) {
      setIsLoaded(true)
    }
  }, [isOpen, isLoaded, user])

  // Navigate to sign in page
  const handleSignIn = useCallback(() => {
    router.push('/auth/login')
  }, [router])

  // Handle ESC key to close chat
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  // Check if we're on restricted pages
  const isAdminPage = pathname?.startsWith('/admin')
  const isAuthPage = pathname?.startsWith('/auth')
  const isRestricted = isAdminPage || isAuthPage

  // Don't render on restricted pages
  if (isRestricted) {
    return null
  }

  return (
    <>
      {/* Toggle/Close Button - Same Position Always */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[10001] flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 group"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X size={28} className="group-hover:rotate-90 transition-transform" />
        ) : (
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        )}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
        )}
      </button>

      {/* Chat Window - Responsive positioning */}
      {isOpen && (
        <div
          className="fixed z-[9999] transition-all duration-300 transform top-0 left-0 right-0 w-full h-[90vh] sm:top-auto sm:bottom-6 sm:right-24 sm:left-auto sm:w-[min(420px,calc(100vw-120px))] sm:h-[min(640px,calc(100vh-48px))]"
        >
          {/* Iframe Container - Full Window */}
          <div className="w-full h-full bg-white shadow-2xl overflow-hidden ring-1 ring-black/10 rounded-b-2xl sm:rounded-2xl">
            {loading ? (
              // Loading state while checking authentication
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-blue-50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 animate-pulse">
                    <MessageCircle size={32} className="text-green-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading...</p>
                </div>
              </div>
            ) : !user ? (
              // Not authenticated - Show login prompt
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
                <div className="text-center max-w-sm">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg">
                    <MessageCircle size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Chat Assistant
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Please sign in to access the Nepal Reforms AI Assistant and get answers to your questions.
                  </p>
                  <button
                    onClick={handleSignIn}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300"
                  >
                    <LogIn size={20} />
                    <span>Sign In to Chat</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Don't have an account?{' '}
                    <button
                      onClick={() => router.push('/auth/signup')}
                      className="text-green-600 hover:text-green-700 font-medium underline"
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </div>
            ) : isLoaded ? (
              // Authenticated - Show chatbot iframe
              <iframe
                src={CHATBOT_URL}
                className="w-full h-full border-0"
                title={CHATBOT_TITLE}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-microphone"
                allow="microphone"
                referrerPolicy="origin"
                loading="lazy"
              />
            ) : (
              // Authenticated but iframe loading
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-blue-50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 animate-pulse">
                    <MessageCircle size={32} className="text-green-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading chat...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile & Responsive Styles */}
      <style jsx>{`
        @media print {
          button[aria-label="Open chat"],
          button[aria-label="Close chat"],
          .fixed.z-\[9999\] {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default FloatingChatWidget
