'use client'

import { useEffect, useState } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface ToastProps {
  message: ToastMessage
  onRemove: (id: string) => void
}

function Toast({ message, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(message.id)
    }, message.duration || 3000)

    return () => clearTimeout(timer)
  }, [message.id, message.duration, onRemove])

  const getToastStyles = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-white'
      case 'info':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return ''
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${getToastStyles()}`}
    >
      <div className="flex items-center space-x-2">
        <span>{getIcon()}</span>
        <span>{message.message}</span>
        <button
          onClick={() => onRemove(message.id)}
          className="ml-2 text-white hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  messages: ToastMessage[]
  onRemove: (id: string) => void
}

export function ToastContainer({ messages, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onRemove={onRemove} />
      ))}
    </div>
  )
}

// Hook para gerenciar toasts
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = (type: ToastMessage['type'], message: string, duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newMessage: ToastMessage = {
      id,
      type,
      message,
      duration
    }
    setMessages(prev => [...prev, newMessage])
  }

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const success = (message: string, duration?: number) => addToast('success', message, duration)
  const error = (message: string, duration?: number) => addToast('error', message, duration)
  const warning = (message: string, duration?: number) => addToast('warning', message, duration)
  const info = (message: string, duration?: number) => addToast('info', message, duration)

  return {
    messages,
    success,
    error,
    warning,
    info,
    removeToast
  }
}
