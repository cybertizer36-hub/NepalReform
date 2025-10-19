'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, ExternalLink, Minimize2, Maximize2 } from 'lucide-react'
import { usePathname } from 'next/navigation'

// Configuration - can be moved to environment variables
const CHATBOT_URL = process.env.NEXT_PUBLIC_CHATBOT_URL || 'https://chat.nepalreforms.com/'
const CHATBOT_TITLE = process.env.NEXT_PUBLIC_CHATBOT_TITLE || 'Nepal Reforms Assistant'
const SHOW_NOTIFICATION_DOT = process.env.NEXT_PUBLIC_SHOW_CHAT_NOTIFICATION === 'true'

const FloatingChatWidget: React.FC = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(SHOW_NOTIFICATION_DOT)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const firstLoadRef = useRef(true)

  // Toggle chat window
  const toggleChat = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true)
      setHasNewMessage(false)
      // Lazy load iframe only on first open
      if (!isLoaded && firstLoadRef.current) {
        setIsLoaded(true)
        firstLoadRef.current = false
      }
      // Auto-enter fullscreen on small screens for better UX
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        setIsFullscreen(true)
      }
    } else {
      setIsOpen(false)
      setIsFullscreen(false)
    }
    setIsMinimized(false)
  }, [isOpen, isLoaded])

  // Open chatbot in new tab
  const openInNewTab = useCallback(() => {
    window.open(CHATBOT_URL, '_blank', 'noopener,noreferrer')
  }, [])

  // Minimize chat window
  const minimizeChat = useCallback(() => {
    setIsMinimized(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsMinimized(false)
    }, 300)
  }, [])

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Handle ESC key to close chat
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleChat()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, toggleChat])

  // Simulate receiving a new message (for demo purposes)
  useEffect(() => {
    if (SHOW_NOTIFICATION_DOT && !isOpen) {
      const timer = setTimeout(() => {
        setHasNewMessage(true)
      }, 5000) // Show notification after 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent body scroll when chat is fullscreen
  useEffect(() => {
    if (isOpen && isFullscreen) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [isOpen, isFullscreen])

  // Check if we're on an admin page or any other restricted pages
  const isAdminPage = pathname?.startsWith('/admin')
  const isAuthPage = pathname?.startsWith('/auth')
  const isRestricted = isAdminPage || isAuthPage

  // Don't render on restricted pages
  if (isRestricted) {
    return null
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group animate-fade-in"
          aria-label="Open chat"
          aria-expanded={isOpen}
        >
          {hasNewMessage && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-sm">
            Chat with us!
          </span>
        </button>
      )}

      {/* Chat Window */}
      <div
        ref={chatWindowRef}
        className={`nr-chat-window fixed z-[9999] transition-all duration-300 transform ${
          isFullscreen 
            ? 'inset-0' 
            : 'bottom-6 right-6'
        } ${
          isOpen && !isMinimized
            ? 'translate-y-0 opacity-100 scale-100'
            : isMinimized
            ? 'translate-y-4 opacity-0 scale-95'
            : 'translate-y-full opacity-0 scale-95 pointer-events-none'
        }`}
        style={
          !isFullscreen
            ? {
                width: 'min(400px, calc(100vw - 48px))',
                height: 'min(600px, calc(100vh - 100px))',
              }
            : {}
        }
      >
        <div className={`w-full h-full bg-white ${isFullscreen ? '' : 'rounded-2xl'} shadow-[0_20px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5 overflow-hidden flex flex-col`}>
          {/* Chat Header */}
          <div className={`bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 flex items-center justify-between ${isFullscreen ? '' : 'rounded-t-2xl'}`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-green-600"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none">{CHATBOT_TITLE}</h3>
                <p className="mt-0.5 text-[11px] opacity-90 flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></span>
                  Online • Ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              {!isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Maximize chat"
                  title="Maximize"
                >
                  <Maximize2 size={17} />
                </button>
              )}
              <button
                onClick={openInNewTab}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Open in new tab"
                title="Open in new tab"
              >
                <ExternalLink size={17} />
              </button>
              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Exit fullscreen"
                  title="Exit fullscreen"
                >
                  <Minimize2 size={17} />
                </button>
              )}
              {!isFullscreen && (
                <button
                  onClick={minimizeChat}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Minimize chat"
                  title="Minimize"
                >
                  <Minimize2 size={17} />
                </button>
              )}
              <button
                onClick={toggleChat}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Close chat"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Chat Body with iframe */}
          <div className="flex-1 relative bg-gray-50">
            {isLoaded ? (
              <iframe
                ref={iframeRef}
                src={CHATBOT_URL}
                className="w-full h-full border-0"
                title={CHATBOT_TITLE}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
                allow="microphone; camera; clipboard-write"
                referrerPolicy="origin"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <MessageCircle size={32} className="text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Start a Conversation
                  </h4>
                  <p className="text-sm text-gray-600">
                    Feel free to ask any questions about Nepal Reforms
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-specific adjustments and animations */}
      <style jsx>{`
        @media (max-width: 640px) {
          button[aria-label="Open chat"] {
            bottom: 1rem !important;
            right: 1rem !important;
          }
          
          .nr-chat-window:not(.inset-0) {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
          }
        }
        
        @media (max-width: 400px) {
          button[aria-label="Open chat"] {
            width: 3rem;
            height: 3rem;
          }
          
          button[aria-label="Open chat"] svg {
            width: 20px;
            height: 20px;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in {
            animation: none;
          }
        }
        
        /* Print styles */
        @media print {
          button[aria-label="Open chat"],
          .nr-chat-window {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default FloatingChatWidget
