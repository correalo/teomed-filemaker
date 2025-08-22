'use client'

import React from 'react'

interface EmailButtonProps {
  email: string
  disabled?: boolean
  className?: string
}

export default function EmailButton({ email, disabled = false, className = '' }: EmailButtonProps) {
  const handleEmailClick = () => {
    if (!email || disabled) return
    
    // Open default email client with the email address
    const emailUrl = `mailto:${email}`
    window.open(emailUrl, '_self')
  }

  if (!email || disabled) {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleEmailClick}
      className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 shadow-md hover:shadow-lg flex-shrink-0 ${className}`}
      title="Enviar Email"
      aria-label="Enviar Email"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </button>
  )
}
