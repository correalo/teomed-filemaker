'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from './Toast'
import { Evolucao, EvolucaoSearchFields } from '../types/evolucao'

interface PortalSectionProps {
  pacienteId: string
  isSearchMode?: boolean
  searchFields?: any
  onSearchFieldChange?: (field: string, value: string) => void
}

const api = axios.create({
  baseURL: 'http://localhost:3004',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default function PortalSection({ pacienteId, isSearchMode = false, searchFields = {}, onSearchFieldChange }: PortalSectionProps) {
  const [activeTab, setActiveTab] = useState('evolucoes')
  
  // Estados para funcionalidade CRUD de evoluções
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([])
  const [editedEvolucoes, setEditedEvolucoes] = useState<Evolucao[]>([])
  const [isEditingLocal, setIsEditingLocal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [pacienteNome, setPacienteNome] = useState<string>('')
  const toast = useToast()
  
  const [newEvolucao, setNewEvolucao] = useState<Evolucao>({
    paciente_id: pacienteId,
    nome_paciente: '',
    data_retorno: format(new Date(), 'yyyy-MM-dd'),
    delta_t: '',
    peso: 0,
    delta_peso: 0,
    exames_alterados: '',
    medicacoes: [],
  })

  // Removed API calls for non-existent endpoints (evolucoes, avaliacoes, exames-preop)
  // These modules were removed from the backend

  // Query para evoluções
  const { data: evolucoesFetched, refetch: refetchEvolucoes } = useQuery({
    queryKey: ['evolucoes', pacienteId],
    queryFn: () => api.get(`/evolucoes/paciente/${pacienteId}`).then(res => res.data),
    enabled: activeTab === 'evolucoes'
  })

  const { data: receitas } = useQuery({
    queryKey: ['receitas', pacienteId],
    queryFn: () => api.get(`/receitas/paciente/${pacienteId}`).then(res => res.data),
    enabled: activeTab === 'receitas'
  })

  // Buscar o nome do paciente
  const fetchPacienteNome = useCallback(async () => {
    try {
      const response = await api.get(`/pacientes/${pacienteId}`)
      const data = response.data
      if (data && data.nome) {
        setPacienteNome(data.nome)
        setNewEvolucao(prev => ({
          ...prev,
          nome_paciente: data.nome
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error)
    }
  }, [pacienteId])

  // Atualizar evoluções quando os dados chegarem
  useEffect(() => {
    if (evolucoesFetched) {
      setEvolucoes(evolucoesFetched)
      setEditedEvolucoes(evolucoesFetched)
    }
  }, [evolucoesFetched])

  // Buscar nome do paciente quando o componente montar
  useEffect(() => {
    if (pacienteId) {
      fetchPacienteNome()
    }
  }, [pacienteId, fetchPacienteNome])

  const tabs = [
    { id: 'evolucoes', label: 'EVOLUÇÕES', color: 'bg-filemaker-blue' },
    { id: 'avaliacoes', label: 'AVALIAÇÕES', color: 'bg-filemaker-green' },
    { id: 'exames', label: 'EXAMES PRÉ-OP', color: 'bg-filemaker-purple' },
    { id: 'receitas', label: 'RECEITAS', color: 'bg-filemaker-red' },
  ]

  // Funções CRUD para evoluções
  const handleCreateEvolucao = async () => {
    if (!newEvolucao.data_retorno) {
      toast.warning('Data de retorno é obrigatória')
      return
    }

    setIsSaving(true)
    try {
      const evolucaoToCreate = {
        ...newEvolucao,
        nome_paciente: newEvolucao.nome_paciente || pacienteNome,
        paciente_id: pacienteId
      }

      const response = await api.post('/evolucoes', evolucaoToCreate)
      
      if (response.data) {
        await refetchEvolucoes()
        
        // Resetar formulário
        setNewEvolucao({
          paciente_id: pacienteId,
          nome_paciente: pacienteNome,
          data_retorno: format(new Date(), 'yyyy-MM-dd'),
          delta_t: '',
          peso: 0,
          delta_peso: 0,
          exames_alterados: '',
          medicacoes: [],
        })
        setShowAddForm(false)
        toast.success('Evolução criada com sucesso!')
      }
    } catch (error: any) {
      console.error('Erro ao criar evolução:', error)
      toast.error(`Erro ao criar evolução: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEvolucoes = async () => {
    setIsSaving(true)
    try {
      const promises = editedEvolucoes.map(async (evolucao) => {
        if (evolucao._id) {
          return await api.put(`/evolucoes/${evolucao._id}`, evolucao)
        }
        return evolucao
      })

      await Promise.all(promises)
      await refetchEvolucoes()
      setIsEditingLocal(false)
      toast.success('Evoluções salvas com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar evoluções:', error)
      toast.error(`Erro ao salvar evoluções: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddEvolucao = async () => {
    if (!newEvolucao.data_retorno) {
      toast.error('Data de retorno é obrigatória')
      return
    }

    setIsSaving(true)
    try {
      const evolucaoData = {
        paciente_id: pacienteId,
        nome_paciente: pacienteNome,
        data_retorno: newEvolucao.data_retorno,
        delta_t: newEvolucao.delta_t || '',
        peso: newEvolucao.peso || 0,
        delta_peso: newEvolucao.delta_peso || 0,
        exames_alterados: newEvolucao.exames_alterados || '',
        medicacoes: Array.isArray(newEvolucao.medicacoes) 
          ? newEvolucao.medicacoes 
          : (newEvolucao.medicacoes && typeof newEvolucao.medicacoes === 'string' ? newEvolucao.medicacoes.split(',').map((item: string) => item.trim()) : [])
      }

      await api.post('/evolucoes', evolucaoData)
      
      // Resetar formulário
      setNewEvolucao({
        paciente_id: pacienteId,
        nome_paciente: pacienteNome,
        data_retorno: '',
        delta_t: '',
        peso: 0,
        delta_peso: 0,
        exames_alterados: '',
        medicacoes: []
      })
      
      setShowAddForm(false)
      await refetchEvolucoes()
      toast.success('Evolução criada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao criar evolução:', error)
      toast.error(`Erro ao criar evolução: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEvolucao = async (evolucaoId: string, index: number) => {
    if (!confirm('Tem certeza que deseja deletar esta evolução?')) {
      return
    }

    try {
      await api.delete(`/evolucoes/${evolucaoId}`)
      await refetchEvolucoes()
      toast.success('Evolução deletada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao deletar evolução:', error)
      toast.error(`Erro ao deletar evolução: ${error.message}`)
    }
  }

  const handleEditEvolucao = (index: number) => {
    const updatedEvolucoes = [...editedEvolucoes]
    updatedEvolucoes[index] = { ...updatedEvolucoes[index], _editing: true }
    setEditedEvolucoes(updatedEvolucoes)
  }

  const handleCancelEdit = (index: number) => {
    const updatedEvolucoes = [...editedEvolucoes]
    updatedEvolucoes[index] = { ...evolucoes[index], _editing: false }
    setEditedEvolucoes(updatedEvolucoes)
  }

  const handleSaveEvolucao = async (index: number) => {
    const evolucao = editedEvolucoes[index]
    if (!evolucao._id) return

    setIsSaving(true)
    try {
      await api.put(`/evolucoes/${evolucao._id}`, evolucao)
      const updatedEvolucoes = [...editedEvolucoes]
      updatedEvolucoes[index] = { ...updatedEvolucoes[index], _editing: false }
      setEditedEvolucoes(updatedEvolucoes)
      await refetchEvolucoes()
      toast.success('Evolução salva com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar evolução:', error)
      toast.error(`Erro ao salvar evolução: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (index: number, field: keyof Evolucao, value: any) => {
    const updatedEvolucoes = [...editedEvolucoes]
    updatedEvolucoes[index] = {
      ...updatedEvolucoes[index],
      [field]: value
    }
    setEditedEvolucoes(updatedEvolucoes)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
    try {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        return dateString
      }
      
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy', { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'evolucoes':
        return (
          <div className="bg-white border border-gray-300">
            {/* Header com título e botões */}
            <div className="bg-filemaker-blue text-white px-3 py-2 flex justify-between items-center">
              <h3 className="text-sm font-bold">EVOLUÇÃO</h3>
              <div className="flex gap-1">
                {!isSearchMode && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                    disabled={isSaving}
                    title="Criar nova evolução"
                  >
                    ➕
                  </button>
                )}
              </div>
            </div>

            {/* Header das colunas */}
            <div className="bg-gray-100 border-b border-gray-300">
              <div className="grid grid-cols-12 gap-1 px-2 py-1">
                <div className="col-span-3 text-xs font-bold text-filemaker-text">NOME</div>
                <div className="col-span-1 text-xs font-bold text-filemaker-text">DATA</div>
                <div className="col-span-1 text-xs font-bold text-filemaker-text">DELTA T</div>
                <div className="col-span-1 text-xs font-bold text-filemaker-text">PESO</div>
                <div className="col-span-1 text-xs font-bold text-filemaker-text">DELTA PESO</div>
                <div className="col-span-2 text-xs font-bold text-filemaker-text">EXAMES ALTERADOS</div>
                <div className="col-span-2 text-xs font-bold text-filemaker-text">MEDICAÇÕES</div>
                <div className="col-span-1 text-xs font-bold text-filemaker-text flex justify-center">
                  AÇÕES
                </div>
              </div>
            </div>

            {/* Formulário para nova evolução */}
            {showAddForm && !isSearchMode && (
              <div className="border-b border-gray-300 bg-yellow-50">
                <div className="grid grid-cols-12 gap-1 px-2 py-2">
                  <input
                    type="text"
                    value={newEvolucao.nome_paciente || pacienteNome}
                    className="col-span-3 border border-gray-300 rounded px-1 py-1 text-xs bg-gray-100"
                    readOnly={true}
                    title="Nome do paciente"
                  />
                  <input
                    type="date"
                    value={newEvolucao.data_retorno}
                    onChange={(e) => setNewEvolucao({ ...newEvolucao, data_retorno: e.target.value })}
                    className="col-span-1 border border-gray-300 rounded px-1 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={newEvolucao.delta_t}
                    onChange={(e) => setNewEvolucao({ ...newEvolucao, delta_t: e.target.value })}
                    className="col-span-1 border border-gray-300 rounded px-1 py-1 text-xs"
                    placeholder="7 DIAS"
                  />
                  <input
                    type="number"
                    value={newEvolucao.peso || ''}
                    onChange={(e) => setNewEvolucao({ ...newEvolucao, peso: parseFloat(e.target.value) })}
                    className="col-span-1 border border-gray-300 rounded px-1 py-1 text-xs"
                    step="0.1"
                    placeholder="178,20"
                  />
                  <input
                    type="number"
                    value={newEvolucao.delta_peso || ''}
                    onChange={(e) => setNewEvolucao({ ...newEvolucao, delta_peso: parseFloat(e.target.value) })}
                    className="col-span-1 border border-gray-300 rounded px-1 py-1 text-xs"
                    step="0.1"
                    placeholder="11"
                  />
                  <input
                    type="text"
                    value={newEvolucao.exames_alterados}
                    onChange={(e) => setNewEvolucao({ ...newEvolucao, exames_alterados: e.target.value })}
                    className="col-span-2 border border-gray-300 rounded px-1 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={Array.isArray(newEvolucao.medicacoes) ? newEvolucao.medicacoes.join(', ') : ''}
                    onChange={(e) => setNewEvolucao({ ...newEvolucao, medicacoes: e.target.value.split(',').map(item => item.trim()) })}
                    className="col-span-2 border border-gray-300 rounded px-1 py-1 text-xs"
                  />
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={handleAddEvolucao}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                      disabled={isSaving}
                      title="Salvar nova evolução"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Linhas de dados */}
            <div className="max-h-96 overflow-y-auto">
              {editedEvolucoes.length > 0 ? (
                editedEvolucoes.map((evolucao, index) => (
                  <div key={`evolucao-${index}-${evolucao._id || index}`} className="border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-1 px-2 py-2">
                      <div className="col-span-3 text-xs py-1 px-1 border border-gray-200 rounded bg-blue-50">
                        {evolucao.nome_paciente}
                      </div>
                      
                      {evolucao._editing ? (
                        <input
                          type="date"
                          value={evolucao.data_retorno ? new Date(evolucao.data_retorno).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleInputChange(index, 'data_retorno', e.target.value)}
                          className="col-span-1 border border-gray-300 rounded px-1 py-1 text-xs"
                        />
                      ) : (
                        <div className="col-span-1 text-xs py-1 px-1 border border-gray-200 rounded bg-white">
                          {formatDate(evolucao.data_retorno)}
                        </div>
                      )}
                      
                      {evolucao._editing ? (
                        <input
                          type="text"
                          value={evolucao.delta_t || ''}
                          onChange={(e) => handleInputChange(index, 'delta_t', e.target.value)}
                          className="col-span-1 border border-gray-300 rounded px-1 py-1 text-xs"
                        />
                      ) : (
                        <div className="col-span-1 text-xs py-1 px-1 border border-gray-200 rounded bg-white">
                          {evolucao.delta_t}
                        </div>
                      )}
                      
                      {evolucao._editing ? (
                        <input
                          type="number"
                          value={evolucao.peso || ''}
                          onChange={(e) => handleInputChange(index, 'peso', parseFloat(e.target.value))}
                          className="col-span-1 border border-gray-300 rounded px-1 py-1 text-xs"
                          step="0.1"
                        />
                      ) : (
                        <div className="col-span-1 text-xs py-1 px-1 border border-gray-200 rounded bg-white">
                          {evolucao.peso}
                        </div>
                      )}
                      
                      {evolucao._editing ? (
                        <input
                          type="number"
                          value={evolucao.delta_peso || ''}
                          onChange={(e) => handleInputChange(index, 'delta_peso', parseFloat(e.target.value))}
                          className="col-span-1 border border-gray-300 rounded px-1 py-1 text-xs"
                          step="0.1"
                        />
                      ) : (
                        <div className="col-span-1 text-xs py-1 px-1 border border-gray-200 rounded bg-white">
                          {evolucao.delta_peso}
                        </div>
                      )}
                      
                      {evolucao._editing ? (
                        <input
                          type="text"
                          value={evolucao.exames_alterados || ''}
                          onChange={(e) => handleInputChange(index, 'exames_alterados', e.target.value)}
                          className="col-span-2 border border-gray-300 rounded px-1 py-1 text-xs"
                        />
                      ) : (
                        <div className="col-span-2 text-xs py-1 px-1 border border-gray-200 rounded bg-white">
                          {evolucao.exames_alterados}
                        </div>
                      )}
                      
                      {evolucao._editing ? (
                        <input
                          type="text"
                          value={Array.isArray(evolucao.medicacoes) ? evolucao.medicacoes.join(', ') : ''}
                          onChange={(e) => handleInputChange(index, 'medicacoes', e.target.value.split(',').map(item => item.trim()))}
                          className="col-span-2 border border-gray-300 rounded px-1 py-1 text-xs"
                        />
                      ) : (
                        <div className="col-span-2 text-xs py-1 px-1 border border-gray-200 rounded bg-white">
                          {Array.isArray(evolucao.medicacoes) ? evolucao.medicacoes.join(', ') : ''}
                        </div>
                      )}
                      
                      <div className="col-span-1 flex justify-center items-center gap-1">
                        {evolucao._editing ? (
                          <>
                            <button
                              onClick={() => handleSaveEvolucao(index)}
                              className="bg-green-600 hover:bg-green-700 text-white px-1 py-1 rounded text-xs"
                              title="Salvar"
                              disabled={isSaving}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleCancelEdit(index)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-1 py-1 rounded text-xs"
                              title="Cancelar"
                              disabled={isSaving}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditEvolucao(index)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-1 py-1 rounded text-xs"
                              title="Editar"
                              disabled={isSaving}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteEvolucao(evolucao._id || '', index)}
                              className="bg-red-600 hover:bg-red-700 text-white px-1 py-1 rounded text-xs"
                              title="Deletar"
                              disabled={!evolucao._id || isSaving}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Nenhuma evolução encontrada
                </div>
              )}
            </div>
          </div>
        )

      case 'avaliacoes':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-3 bg-filemaker-green text-white px-2 py-1 rounded">AVALIAÇÕES</h3>
            <div className="text-center py-8 text-gray-500">
              Módulo de avaliações em desenvolvimento
            </div>
          </div>
        )

      case 'exames':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-3 bg-filemaker-purple text-white px-2 py-1 rounded">EXAMES PRÉ-OP</h3>
            <div className="text-center py-8 text-gray-500">
              Módulo de exames pré-operatórios em desenvolvimento
            </div>
          </div>
        )

      case 'receitas':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-3 bg-filemaker-red text-white px-2 py-1 rounded">RECEITAS</h3>
            {receitas?.length > 0 ? (
              <div className="space-y-3">
                {receitas.map((receita: any, index: number) => (
                  <div key={`receita-${index}-${receita.data_emissao || index}`} className="filemaker-card p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">DATA EMISSÃO</label>
                        <div className="text-sm">{new Date(receita.data_emissao).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">MÉDICO</label>
                        <div className="text-sm">{receita.medico?.nome || 'Não informado'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">CRM</label>
                        <div className="text-sm">{receita.medico?.crm || 'Não informado'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-filemaker-text mb-2">MEDICAMENTOS</label>
                      <div className="space-y-2">
                        {receita.medicamentos?.map((med: any, medIndex: number) => (
                          <div key={`med-${medIndex}-${med.nome || medIndex}`} className="border border-gray-200 rounded p-3">
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <span className="text-xs text-filemaker-text">Nome:</span>
                                <div className="text-sm font-medium">{med.nome}</div>
                              </div>
                              <div>
                                <span className="text-xs text-filemaker-text">Dosagem:</span>
                                <div className="text-sm">{med.dosagem}</div>
                              </div>
                              <div>
                                <span className="text-xs text-filemaker-text">Posologia:</span>
                                <div className="text-sm">{med.posologia}</div>
                              </div>
                              <div>
                                <span className="text-xs text-filemaker-text">Duração:</span>
                                <div className="text-sm">{med.duracao}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma receita cadastrada para este paciente
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium ${activeTab === tab.id 
              ? `${tab.color} text-white` 
              : 'text-filemaker-text hover:bg-gray-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clinical Cards - Always visible in search mode */}
      {isSearchMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Avaliação Clínica */}
          <div className="filemaker-card p-4">
            <h3 className="text-sm font-bold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
              AVALIAÇÃO CLÍNICA
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-filemaker-text mb-1">PESO</label>
                  <div className="flex items-stretch">
                    <input
                      type="number"
                      value={searchFields.peso || ''}
                      onChange={(e) => onSearchFieldChange?.('peso', e.target.value)}
                      className="filemaker-input text-sm bg-orange-50 border-orange-300 focus:border-orange-500 text-right rounded-r-none border-r-0"
                      style={{ backgroundColor: '#fef3e2' }}
                      placeholder="120.3"
                    />
                    <span className="bg-blue-600 text-white text-xs px-3 py-2 rounded-r border border-l-0 border-blue-600 flex items-center font-medium whitespace-nowrap">
                      kg
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-filemaker-text mb-1">ALTURA</label>
                  <div className="flex items-stretch">
                    <input
                      type="number"
                      value={searchFields.altura || ''}
                      onChange={(e) => onSearchFieldChange?.('altura', e.target.value)}
                      className="filemaker-input text-sm bg-orange-50 border-orange-300 focus:border-orange-500 text-right rounded-r-none border-r-0"
                      style={{ backgroundColor: '#fef3e2' }}
                      placeholder="1.63"
                    />
                    <span className="bg-blue-600 text-white text-xs px-3 py-2 rounded-r border border-l-0 border-blue-600 flex items-center font-medium whitespace-nowrap">
                      m
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-filemaker-text mb-1">IMC</label>
                  <input
                    type="number"
                    value={searchFields.imc || ''}
                    onChange={(e) => onSearchFieldChange?.('imc', e.target.value)}
                    className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                    style={{ backgroundColor: '#fef3e2' }}
                    placeholder="45.28"
                  />
                </div>
              </div>
              
              {/* Checkboxes - Primeira coluna */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has"
                      checked={searchFields.has || false}
                      onChange={(e) => onSearchFieldChange?.('has', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="has" className="text-xs text-filemaker-text">HAS</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dislipidemia"
                      checked={searchFields.dislipidemia || false}
                      onChange={(e) => onSearchFieldChange?.('dislipidemia', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="dislipidemia" className="text-xs text-filemaker-text">DISLIPIDEMIA</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="artropatias"
                      checked={searchFields.artropatias || false}
                      onChange={(e) => onSearchFieldChange?.('artropatias', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="artropatias" className="text-xs text-filemaker-text">ARTROPATIAS</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="esteatose"
                      checked={searchFields.esteatose || false}
                      onChange={(e) => onSearchFieldChange?.('esteatose', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="esteatose" className="text-xs text-filemaker-text">ESTEATOSE</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="refluxo"
                      checked={searchFields.refluxo || false}
                      onChange={(e) => onSearchFieldChange?.('refluxo', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="refluxo" className="text-xs text-filemaker-text">REFLUXO</label>
                  </div>
                </div>
                
                {/* Checkboxes - Segunda coluna */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="diabetes"
                      checked={searchFields.diabetes || false}
                      onChange={(e) => onSearchFieldChange?.('diabetes', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="diabetes" className="text-xs text-filemaker-text">DIABETES</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anemia"
                      checked={searchFields.anemia || false}
                      onChange={(e) => onSearchFieldChange?.('anemia', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="anemia" className="text-xs text-filemaker-text">ANEMIA</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ccc"
                      checked={searchFields.ccc || false}
                      onChange={(e) => onSearchFieldChange?.('ccc', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="ccc" className="text-xs text-filemaker-text">CCC</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hernia_hiato"
                      checked={searchFields.hernia_hiato || false}
                      onChange={(e) => onSearchFieldChange?.('hernia_hiato', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="hernia_hiato" className="text-xs text-filemaker-text">HÉRNIA DE HIATO</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hernia_incisional"
                      checked={searchFields.hernia_incisional || false}
                      onChange={(e) => onSearchFieldChange?.('hernia_incisional', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="hernia_incisional" className="text-xs text-filemaker-text">HÉRNIA INCISIONAL</label>
                  </div>
                </div>
              </div>
              
              {/* Cirurgia Prévia */}
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">CIRURGIA PRÉVIA</label>
                <input
                  type="text"
                  value={searchFields.cirurgia_previa || ''}
                  onChange={(e) => onSearchFieldChange?.('cirurgia_previa', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar cirurgia prévia..."
                />
              </div>
            </div>
          </div>

          {/* Antecedentes */}
          <div className="filemaker-card p-4">
            <h3 className="text-sm font-bold mb-3 bg-filemaker-green text-white px-2 py-1 rounded">
              ANTECEDENTES
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ANTECEDENTE PATERNO</label>
                <input
                  type="text"
                  value={searchFields.antecedente_paterno || ''}
                  onChange={(e) => onSearchFieldChange?.('antecedente_paterno', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar antecedente paterno..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ANTECEDENTE MATERNO</label>
                <input
                  type="text"
                  value={searchFields.antecedente_materno || ''}
                  onChange={(e) => onSearchFieldChange?.('antecedente_materno', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar antecedente materno..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ANTECEDENTE TIOS</label>
                <input
                  type="text"
                  value={searchFields.antecedente_tios || ''}
                  onChange={(e) => onSearchFieldChange?.('antecedente_tios', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar antecedente tios..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ANTECEDENTE AVÓS</label>
                <input
                  type="text"
                  value={searchFields.antecedente_avos || ''}
                  onChange={(e) => onSearchFieldChange?.('antecedente_avos', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar antecedente avós..."
                />
              </div>
            </div>
          </div>

          {/* Medicamentos Pré-Op - Removed duplicate fields */}
          <div className="filemaker-card p-4">
            <h3 className="text-sm font-bold mb-3 bg-filemaker-orange text-white px-2 py-1 rounded">
              MEDICAMENTOS PRÉ-OP
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">MEDICAMENTO</label>
                <input
                  type="text"
                  value={searchFields.medicamento_preop || ''}
                  onChange={(e) => onSearchFieldChange?.('medicamento_preop', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar medicamento..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">DOSAGEM</label>
                <input
                  type="text"
                  value={searchFields.dosagem_preop || ''}
                  onChange={(e) => onSearchFieldChange?.('dosagem_preop', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar dosagem..."
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content - Hidden in search mode */}
      {!isSearchMode && (
        <div className="mt-4">
          {renderContent()}
        </div>
      )}
    </div>
  )
}
