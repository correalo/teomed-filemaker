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
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchFilters, setSearchFilters] = useState<any>({})
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([])
  const [searchFields, setSearchFields] = useState<any>({})
  const [pendingSearchFields, setPendingSearchFields] = useState<any>({})
  const router = useRouter()
  const { data, isLoading, error } = usePacientes(1, 10000, isSearchMode ? searchFilters : undefined)
  const toast = useToast()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const API_BASE_URL = 'http://localhost:3005'
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }
    }
  }, [router])

  // Sempre navegar para o último paciente quando os dados estiverem disponíveis
  useEffect(() => {
    if (data?.pacientes?.length && mounted) {
      // Sempre ir para o último paciente da lista
      setCurrentPacienteIndex(data.pacientes.length - 1)
    }
  }, [data?.pacientes, mounted])

  // Salvar índice atual sempre que mudar
  useEffect(() => {
    if (mounted && data?.pacientes?.length) {
      localStorage.setItem('lastPacienteIndex', currentPacienteIndex.toString())
    }
  }, [currentPacienteIndex, mounted, data?.pacientes])

  // Função para executar busca
  const executeSearch = () => {
    if (!isSearchMode) return
    
    const filters = { ...pendingSearchFields }
    if (searchTerm.trim()) {
      filters.q = searchTerm.trim()
    }
    
    // Remover campos vazios
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    )
    
    // Armazenar os filtros de busca para identificar o paciente correto
    setSearchFilters(cleanFilters)
    setSearchFields(pendingSearchFields)
    
    // Sair do modo busca após executar
    setIsSearchMode(false)
    
    toast.info(`Busca executada com ${Object.keys(cleanFilters).length} filtro(s)`)
  }

  // Função para limpar busca
  const clearSearch = () => {
    setSearchTerm('')
    setSearchFilters({})
    setSearchFields({})
    setPendingSearchFields({})
    toast.info('Filtros de busca limpos')
  }

  // Atualizar lista filtrada quando dados mudarem
  useEffect(() => {
    if (data?.pacientes) {
      setFilteredPacientes(data.pacientes)
      // Só navegar para último se não estiver em modo busca e não houver filtros aplicados
      if (!isSearchMode && Object.keys(searchFilters).length === 0 && data.pacientes.length > 0) {
        setCurrentPacienteIndex(data.pacientes.length - 1) // Último paciente apenas quando não há busca
      }
    }
  }, [data?.pacientes, isSearchMode, searchFilters])

  // Função para encontrar o paciente mais relevante baseado nos filtros de busca
  const findMostRelevantPatient = (pacientes: any[], filters: any) => {
    if (!pacientes.length || !Object.keys(filters).length) return 0

    // Prioridade 1: Campos únicos/identificadores
    if (filters.cpf) {
      const cpfMatch = pacientes.findIndex(p => 
        p.documentos?.cpf?.replace(/\D/g, '') === filters.cpf.replace(/\D/g, '')
      )
      if (cpfMatch !== -1) return cpfMatch
    }

    if (filters.prontuario) {
      const prontuarioMatch = pacientes.findIndex(p => 
        p.prontuario === Number(filters.prontuario)
      )
      if (prontuarioMatch !== -1) return prontuarioMatch
    }

    if (filters.rg) {
      const rgMatch = pacientes.findIndex(p => 
        p.documentos?.rg?.toLowerCase() === filters.rg.toLowerCase()
      )
      if (rgMatch !== -1) return rgMatch
    }

    if (filters.carteirinha) {
      const carteirinhaMatch = pacientes.findIndex(p => 
        p.convenio?.carteirinha?.toLowerCase() === filters.carteirinha.toLowerCase()
      )
      if (carteirinhaMatch !== -1) return carteirinhaMatch
    }

    // Prioridade 2: Nome (match exato primeiro)
    if (filters.nome) {
      const exactNameMatch = pacientes.findIndex(p => 
        p.nome?.toLowerCase() === filters.nome.toLowerCase()
      )
      if (exactNameMatch !== -1) return exactNameMatch
      
      const startsWithMatch = pacientes.findIndex(p => 
        p.nome?.toLowerCase().startsWith(filters.nome.toLowerCase())
      )
      if (startsWithMatch !== -1) return startsWithMatch
    }

    // Prioridade 3: Contatos
    if (filters.email) {
      const emailMatch = pacientes.findIndex(p => 
        p.contato?.email?.toLowerCase() === filters.email.toLowerCase()
      )
      if (emailMatch !== -1) return emailMatch
    }

    if (filters.telefone) {
      const telefoneMatch = pacientes.findIndex(p => 
        p.contato?.telefone?.replace(/\D/g, '') === filters.telefone.replace(/\D/g, '')
      )
      if (telefoneMatch !== -1) return telefoneMatch
    }

    if (filters.celular) {
      const celularMatch = pacientes.findIndex(p => 
        p.contato?.celular?.replace(/\D/g, '') === filters.celular.replace(/\D/g, '')
      )
      if (celularMatch !== -1) return celularMatch
    }

    // Prioridade 4: Endereço
    if (filters.logradouro) {
      const logradouroMatch = pacientes.findIndex(p => 
        p.endereco?.normalizado?.logradouro?.toLowerCase().includes(filters.logradouro.toLowerCase())
      )
      if (logradouroMatch !== -1) return logradouroMatch
    }

    if (filters.numero) {
      const numeroMatch = pacientes.findIndex(p => 
        p.endereco?.numero === filters.numero
      )
      if (numeroMatch !== -1) return numeroMatch
    }

    if (filters.cep) {
      const cepMatch = pacientes.findIndex(p => 
        p.endereco?.cep?.replace(/\D/g, '') === filters.cep.replace(/\D/g, '')
      )
      if (cepMatch !== -1) return cepMatch
    }

    if (filters.bairro) {
      const bairroMatch = pacientes.findIndex(p => 
        p.endereco?.normalizado?.bairro?.toLowerCase().includes(filters.bairro.toLowerCase())
      )
      if (bairroMatch !== -1) return bairroMatch
    }

    if (filters.cidade) {
      const cidadeMatch = pacientes.findIndex(p => 
        p.endereco?.normalizado?.cidade?.toLowerCase().includes(filters.cidade.toLowerCase())
      )
      if (cidadeMatch !== -1) return cidadeMatch
    }

    if (filters.estado) {
      const estadoMatch = pacientes.findIndex(p => 
        p.endereco?.normalizado?.estado?.toLowerCase() === filters.estado.toLowerCase()
      )
      if (estadoMatch !== -1) return estadoMatch
    }

    // Prioridade 5: Convênio
    if (filters.convenio) {
      const convenioMatch = pacientes.findIndex(p => 
        p.convenio?.nome?.toLowerCase().includes(filters.convenio.toLowerCase())
      )
      if (convenioMatch !== -1) return convenioMatch
    }

    if (filters.plano) {
      const planoMatch = pacientes.findIndex(p => 
        p.convenio?.plano?.toLowerCase().includes(filters.plano.toLowerCase())
      )
      if (planoMatch !== -1) return planoMatch
    }

    // Prioridade 6: Dados demográficos
    if (filters.sexo) {
      const sexoMatch = pacientes.findIndex(p => 
        p.sexo?.toLowerCase() === filters.sexo.toLowerCase()
      )
      if (sexoMatch !== -1) return sexoMatch
    }

    if (filters.idade) {
      const idadeMatch = pacientes.findIndex(p => 
        p.idade === Number(filters.idade)
      )
      if (idadeMatch !== -1) return idadeMatch
    }

    if (filters.dataNascimento) {
      const nascimentoMatch = pacientes.findIndex(p => 
        p.dataNascimento === filters.dataNascimento
      )
      if (nascimentoMatch !== -1) return nascimentoMatch
    }

    // Prioridade 7: Outros campos
    if (filters.indicacao) {
      const indicacaoMatch = pacientes.findIndex(p => 
        p.indicacao?.toLowerCase().includes(filters.indicacao.toLowerCase())
      )
      if (indicacaoMatch !== -1) return indicacaoMatch
    }

    if (filters.peso) {
      const pesoMatch = pacientes.findIndex(p => 
        Math.abs(p.peso - Number(filters.peso)) < 0.1
      )
      if (pesoMatch !== -1) return pesoMatch
    }

    if (filters.altura) {
      const alturaMatch = pacientes.findIndex(p => 
        Math.abs(p.altura - Number(filters.altura)) < 0.01
      )
      if (alturaMatch !== -1) return alturaMatch
    }

    if (filters.imc) {
      const imcMatch = pacientes.findIndex(p => 
        Math.abs(p.imc - Number(filters.imc)) < 0.1
      )
      if (imcMatch !== -1) return imcMatch
    }

    // Caso contrário, retornar o primeiro resultado
    return 0
  }

  // Navegar para paciente mais relevante após busca
  useEffect(() => {
    if (!isSearchMode && data?.pacientes && data.pacientes.length > 0 && Object.keys(searchFilters).length > 0) {
      const relevantIndex = findMostRelevantPatient(data.pacientes, searchFilters)
      setCurrentPacienteIndex(relevantIndex)
    }
  }, [searchFilters, data?.pacientes, isSearchMode])

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode)
    setSearchTerm('')
    setSearchFilters({})
    setSearchFields({})
    setPendingSearchFields({})
    if (!isSearchMode) {
      // Entrando no modo busca
      toast.info('Modo Busca ativado - Preencha os campos e clique em Buscar')
    } else {
      // Saindo do modo busca
      toast.info('Modo Busca desativado')
    }
  }

  const handleSearchFieldChange = (field: string, value: string) => {
    setPendingSearchFields((prev: any) => ({
      ...prev,
      [field]: value || undefined
    }))
  }

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
      <div className="min-h-screen bg-filemaker-gray flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full border border-gray-200">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {isSearchMode ? 'Nenhum resultado encontrado' : 'Nenhum paciente cadastrado'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isSearchMode 
              ? 'Não foram encontrados pacientes com os critérios de busca informados. Tente ajustar os filtros ou limpar a busca.'
              : 'Não há pacientes cadastrados no sistema. Comece adicionando um novo paciente.'
            }
          </p>
          
          <div className="space-y-3">
            {isSearchMode ? (
              <>
                <button 
                  onClick={() => {
                    setIsSearchMode(false)
                    setSearchFilters({})
                    setSearchFields({})
                    setSearchTerm('')
                    toast.info('Busca limpa - mostrando todos os pacientes')
                  }}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Voltar e Ver Todos os Pacientes
                </button>
                <button 
                  onClick={() => {
                    setSearchFields({})
                    setSearchTerm('')
                    toast.info('Filtros de busca limpos')
                  }}
                  className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Limpar Filtros de Busca
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Cadastrar Primeiro Paciente
              </button>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {isSearchMode ? 'Dica: Use filtros mais amplos para encontrar mais resultados' : 'Precisa de ajuda? Entre em contato com o suporte'}
            </p>
          </div>
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
        <div className="hidden lg:block space-y-4">
          {/* Primeira linha: Título e barra de navegação */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-sm">Teomed Pacientes</h1>
            
            {/* Barra deslizante com setas - ocupando o restante do espaço */}
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setCurrentPacienteIndex(prev => Math.max(0, prev - 1))}
                disabled={currentPacienteIndex === 0}
                className="px-3 py-2 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold"
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
                className="px-3 py-2 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold"
                title="Próximo paciente"
              >
                &gt;
              </button>
            </div>
          </div>
          
          {/* Segunda linha: Busca e botões */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={toggleSearchMode}
                className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium ${
                  isSearchMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSearchMode ? '🔍 Sair Busca' : '🔍 Modo Busca'}
              </button>
              {isSearchMode && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={executeSearch}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    🔍 Buscar
                  </button>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    🗑️ Limpar
                  </button>
                  <div className="text-sm text-orange-700 font-medium">
                    {data?.total || 0} resultado(s)
                  </div>
                </div>
              )}
            </div>
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
          {/* Primeira linha: Título e botões */}
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">Teomed Pacientes</h1>
            <div className="flex gap-2">
              <button
                onClick={toggleSearchMode}
                className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all duration-200 shadow-md text-xs sm:text-sm font-medium ${
                  isSearchMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSearchMode ? '🔍' : '🔍'}
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md text-sm font-medium"
              >
                ➕ Novo
              </button>
            </div>
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
          
          {/* Terceira linha: Botões de busca e contador */}
          {isSearchMode && (
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-center gap-2">
                <button
                  onClick={executeSearch}
                  className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-md text-xs font-medium"
                >
                  🔍 Buscar
                </button>
                <button
                  onClick={clearSearch}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md text-xs font-medium"
                >
                  🗑️ Limpar
                </button>
              </div>
              <div className="w-full flex justify-center">
                <div className="text-xs text-orange-200 font-medium">
                  {data?.total || 0} resultado(s)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Responsivo */}
      <div className="p-2 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">

        {/* Patient Card */}
        <PacienteCard 
          paciente={currentPaciente} 
          isSearchMode={isSearchMode}
          searchFields={pendingSearchFields}
          onSearchFieldChange={handleSearchFieldChange}
        />
        
        {/* Portal Section */}
        <PortalSection 
          pacienteId={currentPaciente._id} 
          isSearchMode={isSearchMode}
          searchFields={pendingSearchFields}
          onSearchFieldChange={handleSearchFieldChange}
        />
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
