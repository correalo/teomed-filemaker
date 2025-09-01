import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Paciente } from '@/types/paciente'

const api = axios.create({
  baseURL: 'http://localhost:3005',
})

api.interceptors.request.use((config) => {
  // Garantir que headers existam
  config.headers = config.headers || {}
  
  if (typeof window !== 'undefined') {
    // Tentar obter o token de múltiplas fontes
    let token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    // Se não encontrou, tentar extrair do cookie
    if (!token) {
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'token') {
          token = value
          break
        }
      }
    }
    
    if (token) {
      // Definir o token no header de autorização
      config.headers.Authorization = `Bearer ${token}`
      
      // Verificar validade do token (opcional, pode ser removido se causar problemas)
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]))
        const expirationTime = tokenData.exp * 1000
        
        // Se o token estiver próximo de expirar (menos de 5 minutos), forçar login
        if (Date.now() >= (expirationTime - 5 * 60 * 1000)) {
          console.warn('Token próximo da expiração ou expirado')
          // Comentado para evitar redirecionamentos indesejados durante testes
          // window.location.href = '/'
          // return Promise.reject('Token expirado')
        }
      } catch (error) {
        console.warn('Erro ao verificar token, continuando mesmo assim')
      }
    } else {
      console.warn('Nenhum token encontrado')
    }
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.error('Erro de autenticação 401:', error.config?.url)
      
      // Limpar todos os tokens
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      
      // Limpar cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      // Evitar loop de redirecionamento se já estiver na página de login
      if (!window.location.pathname.includes('/')) {
        window.location.href = '/'
      }
    }
    
    // Tratar outros erros comuns
    if (error.response?.status === 404) {
      console.error('Recurso não encontrado:', error.config?.url)
    } else if (error.response?.status === 500) {
      console.error('Erro interno do servidor:', error.config?.url)
    } else if (!error.response && error.request) {
      console.error('Sem resposta do servidor - verifique se o backend está rodando')
    }
    
    return Promise.reject(error)
  }
)

interface PacientesResponse {
  pacientes: Paciente[]
  total: number
  totalPages: number
}

export const usePacientes = (page: number = 1, limit: number = 100, filters?: any) => {
  // Serializar filtros para garantir que mudanças sejam detectadas
  const filtersKey = filters ? JSON.stringify(filters) : null
  
  return useQuery<PacientesResponse>({
    queryKey: ['pacientes', page, limit, filtersKey],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      // Adicionar filtros se existirem
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== '') {
            params.append(key, value as string);
          }
        });
      }
      
      const response = await api.get(`/pacientes?${params.toString()}`)
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
    retry: 1,
  })
}

export const usePaciente = (id: string) => {
  return useQuery<Paciente>({
    queryKey: ['paciente', id],
    queryFn: async () => {
      const response = await api.get(`/pacientes/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}
