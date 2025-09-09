'use client'

import { useState } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

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

export default useToast
