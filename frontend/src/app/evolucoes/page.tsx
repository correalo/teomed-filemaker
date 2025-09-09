'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import EvolucaoCard from '@/components/EvolucaoCard'
import { Evolucao, EvolucaoSearchFields } from '@/types/evolucao'
import { useToast } from '@/hooks/useToast'

export default function EvolucoesPage() {
  const searchParams = useSearchParams()
  const pacienteId = searchParams.get('pacienteId')
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (pacienteId) {
      fetchEvolucoes()
    }
  }, [pacienteId])

  const fetchEvolucoes = async () => {
    if (!pacienteId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/evolucoes?pacienteId=${pacienteId}`)
      if (response.ok) {
        const data = await response.json()
        setEvolucoes(data)
      } else {
        console.error('Erro ao buscar evoluções')
        toast.error('Erro ao buscar evoluções')
      }
    } catch (error) {
      console.error('Erro ao buscar evoluções:', error)
      toast.error('Erro ao buscar evoluções')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEvolucoes = async (updatedEvolucoes: Evolucao[]) => {
    setEvolucoes(updatedEvolucoes)
    
    // Aqui você pode implementar a lógica para salvar as evoluções no backend
    // Por exemplo:
    // try {
    //   const response = await fetch('/evolucoes', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(updatedEvolucoes)
    //   })
    //   if (response.ok) {
    //     toast.success('Evoluções salvas com sucesso')
    //   } else {
    //     toast.error('Erro ao salvar evoluções')
    //   }
    // } catch (error) {
    //   console.error('Erro ao salvar evoluções:', error)
    //   toast.error('Erro ao salvar evoluções')
    // }
  }

  const handleSearchEvolucoes = async (searchFields: EvolucaoSearchFields) => {
    if (!pacienteId) return
    
    setIsLoading(true)
    try {
      // Construir a query string com os campos de busca
      const queryParams = new URLSearchParams()
      queryParams.append('pacienteId', pacienteId)
      
      Object.entries(searchFields).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString())
        }
      })
      
      const response = await fetch(`/api/evolucoes?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEvolucoes(data)
      } else {
        console.error('Erro ao buscar evoluções')
        toast.error('Erro ao buscar evoluções')
      }
    } catch (error) {
      console.error('Erro ao buscar evoluções:', error)
      toast.error('Erro ao buscar evoluções')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEditMode = () => {
    setIsEditing(prev => !prev)
    if (isSearchMode) {
      setIsSearchMode(false)
      toast.info('Modo de busca desativado')
    }
  }

  const toggleSearchMode = () => {
    setIsSearchMode(prev => !prev)
    if (isEditing) {
      setIsEditing(false)
      toast.info('Modo de edição desativado')
    }
    
    if (!isSearchMode) {
      toast.info('Modo de busca ativado')
    } else {
      fetchEvolucoes() // Recarregar todas as evoluções ao sair do modo de busca
      toast.info('Modo de busca desativado')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-filemaker-blue">Evoluções</h1>
        <div className="space-x-2">
          <button
            onClick={toggleEditMode}
            className={`px-4 py-2 rounded ${
              isEditing ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {isEditing ? 'Salvar' : 'Editar'}
          </button>
          <button
            onClick={toggleSearchMode}
            className={`px-4 py-2 rounded ${
              isSearchMode ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {isSearchMode ? 'Sair da Busca' : 'Buscar'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-filemaker-blue"></div>
        </div>
      ) : pacienteId ? (
        <EvolucaoCard
          pacienteId={pacienteId}
          evolucoes={evolucoes}
          isEditing={isEditing}
          isSearchMode={isSearchMode}
          onUpdate={handleUpdateEvolucoes}
          onSearch={handleSearchEvolucoes}
        />
      ) : (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Selecione um paciente para visualizar suas evoluções.</p>
        </div>
      )}
    </div>
  )
}
