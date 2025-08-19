'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PacienteCard from '@/components/PacienteCard'
import NavigationArrows from '@/components/NavigationArrows'
import PortalSection from '@/components/PortalSection'
import { usePacientes } from '@/hooks/usePacientes'
import { Paciente } from '@/types/paciente'

export default function PacientesPage() {
  const [currentPacienteIndex, setCurrentPacienteIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { data: pacientesData, isLoading, error } = usePacientes()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }
    }
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-filemaker-gray flex items-center justify-center">
        <div className="filemaker-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-filemaker-blue mx-auto mb-4"></div>
          <p className="text-filemaker-text">Inicializando...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-filemaker-gray flex items-center justify-center">
        <div className="filemaker-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-filemaker-blue mx-auto mb-4"></div>
          <p className="text-filemaker-text">Carregando pacientes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-filemaker-gray flex items-center justify-center">
        <div className="filemaker-card p-8 text-center">
          <div className="text-filemaker-red mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-filemaker-text mb-2">Erro ao carregar dados</h2>
          <p className="text-filemaker-text mb-4">Verifique sua conexão e tente novamente</p>
          <button 
            onClick={() => window.location.reload()} 
            className="filemaker-button"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!pacientesData?.pacientes?.length) {
    return (
      <div className="min-h-screen bg-filemaker-gray flex items-center justify-center">
        <div className="filemaker-card p-8 text-center">
          <div className="text-filemaker-text mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-filemaker-text mb-2">Nenhum paciente encontrado</h2>
          <p className="text-filemaker-text">Verifique se há dados no banco de dados</p>
        </div>
      </div>
    )
  }

  const pacientes = pacientesData.pacientes
  const currentPaciente = pacientes[currentPacienteIndex]

  const handleNext = () => {
    if (currentPacienteIndex < pacientes.length - 1) {
      setCurrentPacienteIndex(currentPacienteIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPacienteIndex > 0) {
      setCurrentPacienteIndex(currentPacienteIndex - 1)
    }
  }

  const handleJump = (steps: number) => {
    const newIndex = currentPacienteIndex + steps
    const clampedIndex = Math.max(0, Math.min(pacientes.length - 1, newIndex))
    setCurrentPacienteIndex(clampedIndex)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    // Implement search logic here
  }

  return (
    <div className="min-h-screen bg-filemaker-gray">
      {/* Header */}
      <div className="bg-white border-b border-filemaker-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-filemaker-header">TEOMED</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="filemaker-input w-64"
            />
            <NavigationArrows
              onPrevious={handlePrevious}
              onNext={handleNext}
              onJump={handleJump}
              canGoPrevious={currentPacienteIndex > 0}
              canGoNext={currentPacienteIndex < pacientes.length - 1}
              currentIndex={currentPacienteIndex + 1}
              total={pacientes.length}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Patient Card */}
        <PacienteCard paciente={currentPaciente} />
        
        {/* Portal Section */}
        <PortalSection pacienteId={currentPaciente._id} />
      </div>
    </div>
  )
}
