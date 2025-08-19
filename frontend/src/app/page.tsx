'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showClearOption, setShowClearOption] = useState(false)
  const router = useRouter()

  const clearSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      setShowClearOption(false)
      window.location.reload()
    }
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    router.push('/pacientes')
  }

  if (isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TEOMED</h1>
          <p className="text-gray-600">Sistema de Prontuários Médicos</p>
          {showClearOption && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
              <p className="text-sm text-yellow-800 mb-2">Problema com redirecionamento?</p>
              <button 
                onClick={clearSession}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Limpar Sessão
              </button>
            </div>
          )}
        </div>
        <LoginForm onLogin={handleLogin} />
        <div className="text-center mt-4">
          <button 
            onClick={() => setShowClearOption(!showClearOption)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Problemas de acesso?
          </button>
        </div>
      </div>
    </main>
  )
}
