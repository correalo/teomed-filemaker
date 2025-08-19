import { useQuery } from 'react-query'
import axios from 'axios'
import { Paciente } from '@/types/paciente'

const api = axios.create({
  baseURL: 'http://localhost:3001',
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

interface PacientesResponse {
  pacientes: Paciente[]
  total: number
  totalPages: number
}

export const usePacientes = (page: number = 1, limit: number = 100) => {
  return useQuery<PacientesResponse>(
    ['pacientes', page, limit],
    async () => {
      const response = await api.get(`/pacientes?page=${page}&limit=${limit}`)
      return response.data
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
      retry: 1,
      onError: (error) => {
        console.error('Erro ao carregar pacientes:', error)
      }
    }
  )
}

export const usePaciente = (id: string) => {
  return useQuery<Paciente>(
    ['paciente', id],
    async () => {
      const response = await api.get(`/pacientes/${id}`)
      return response.data
    },
    {
      enabled: !!id,
    }
  )
}
