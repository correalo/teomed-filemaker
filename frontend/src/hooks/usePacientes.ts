import { useQuery } from '@tanstack/react-query'
import { Paciente } from '@/types/paciente'
import api from '@/utils/api'

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
      
      // Verificar se estamos no navegador para acessar localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Usar a rota de API local para evitar problemas de CORS
      const response = await fetch(`/api/pacientes?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar pacientes: ${response.status}`)
      }
      
      return await response.json()
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
      // Verificar se estamos no navegador para acessar localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Usar a rota de API local para evitar problemas de CORS
      const response = await fetch(`/api/pacientes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar paciente: ${response.status}`)
      }
      
      return await response.json()
    },
    enabled: !!id,
  })
}
