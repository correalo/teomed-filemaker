'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PacienteCard from '../../components/PacienteCard'
import NavigationArrows from '@/components/NavigationArrows'
import PortalSection from '@/components/PortalSection'
import CreatePacienteForm from '@/components/CreatePacienteForm'
import FileMakerSlider from '@/components/FileMakerSlider'
import { usePacientes } from '@/hooks/usePacientes'
import { Paciente } from '@/types/paciente'
import { ToastContainer, useToast } from '@/components/Toast'

export default function PacientesPage() {
  const [currentPacienteIndex, setCurrentPacienteIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()
  const { data, isLoading, error } = usePacientes(1, 10000)
  const toast = useToast()

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

  if (!data?.pacientes?.length) {
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

  const pacientes = data.pacientes
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

  const handleCreateSuccess = (newPaciente: Paciente) => {
    // Refresh the data or add to local state
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-filemaker-gray">
      {/* Header - Responsivo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 border-b border-blue-700 p-2 sm:p-4 shadow-lg">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-sm">Teomed-Pacientes</h1>
            
            {/* Barra deslizante com setas */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPacienteIndex(prev => Math.max(0, prev - 1))}
                disabled={currentPacienteIndex === 0}
                className="px-3 py-2 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold"
                title="Paciente anterior"
              >
                &lt;
              </button>
              <FileMakerSlider
                currentIndex={currentPacienteIndex}
                total={pacientes.length}
                onSlide={(index) => setCurrentPacienteIndex(index)}
              />
              <button
                onClick={() => setCurrentPacienteIndex(prev => Math.min(pacientes.length - 1, prev + 1))}
                disabled={currentPacienteIndex === pacientes.length - 1}
                className="px-3 py-2 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold"
                title="Próximo paciente"
              >
                &gt;
              </button>
            </div>
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm"
            />
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              ➕ Novo Paciente
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-3">
          {/* Primeira linha: Título e botão novo */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">Teomed-Pacientes</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md text-sm font-medium"
            >
              ➕ Novo
            </button>
          </div>
          
          {/* Segunda linha: Navegação */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPacienteIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPacienteIndex === 0}
              className="px-2 py-1 sm:px-3 sm:py-2 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base sm:text-lg font-bold"
              title="Paciente anterior"
            >
              &lt;
            </button>
            <div className="flex-1">
              <FileMakerSlider
                currentIndex={currentPacienteIndex}
                total={pacientes.length}
                onSlide={(index) => setCurrentPacienteIndex(index)}
              />
            </div>
            <button
              onClick={() => setCurrentPacienteIndex(prev => Math.min(pacientes.length - 1, prev + 1))}
              disabled={currentPacienteIndex === pacientes.length - 1}
              className="px-2 py-1 sm:px-3 sm:py-2 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base sm:text-lg font-bold"
              title="Próximo paciente"
            >
              &gt;
            </button>
          </div>
          
          {/* Terceira linha: Busca */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content - Responsivo */}
      <div className="p-2 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Patient Card */}
        <PacienteCard paciente={currentPaciente} />
        
        {/* Portal Section */}
        <PortalSection pacienteId={currentPaciente._id} />
      </div>

      {/* Create Patient Modal */}
      {showCreateForm && (
        <CreatePacienteForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Toast Container */}
      <ToastContainer messages={toast.messages} onRemove={toast.removeToast} />
    </div>
  )
}
