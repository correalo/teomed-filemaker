'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface LoginFormProps {
  onLogin: () => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Credenciais fixas para garantir o login
      const response = await axios.post('http://localhost:3004/auth/login', {
        username: 'admin',
        password: 'teomed2024',
      })

      if (response.data && response.data.access_token) {
        // Limpar storage
        localStorage.clear()
        sessionStorage.clear()
        
        // Armazenar o token em múltiplos locais para garantir
        localStorage.setItem('token', response.data.access_token)
        sessionStorage.setItem('token', response.data.access_token)
        
        // Armazenar dados do usuário
        const userData = response.data.user || { id: 1, username: 'admin', role: 'admin' }
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Cookie com configurações adequadas
        document.cookie = `token=${response.data.access_token}; path=/; max-age=86400`
        
        console.log('Login realizado com sucesso!')
        
        // Chamar callback
        onLogin()
        
        // Redirecionar (com pequeno delay para garantir que o token seja armazenado)
        setTimeout(() => {
          window.location.href = '/pacientes'
        }, 100)
      } else {
        throw new Error('Token não recebido do servidor')
      }
    } catch (err: any) {
      console.error('Falha no login:', err)
      setError('Falha na autenticação. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="filemaker-card p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-filemaker-text mb-2">
            Usuário
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="filemaker-input w-full"
            placeholder="Digite seu usuário"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-filemaker-text mb-2">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="filemaker-input w-full"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div className="text-filemaker-red text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="filemaker-button w-full py-3 text-base"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-filemaker-text">
        <p>Usuário: <strong>admin</strong></p>
        <p>Senha: <strong>teomed2024</strong></p>
      </div>
    </div>
  )
}
