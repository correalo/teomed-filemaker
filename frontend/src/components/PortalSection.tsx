'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { useToast } from './Toast'
import { useAvaliacao } from '../hooks/useAvaliacao'
import { useEvolucoes } from '../hooks/useEvolucoes'
import { useReceitas } from '../hooks/useReceitas'
import { useExame } from '../hooks/useExames'
import { Evolucao, EvolucaoSearchFields } from '../types/evolucao'
import { formatDate } from '../utils/formatters'

// Importar PDFViewer dinamicamente para evitar SSR
const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false })

interface PortalSectionProps {
  pacienteId: string
  pacienteNome?: string
  isSearchMode?: boolean
  searchFields?: any
  onSearchFieldChange?: (field: string, value: string) => void
}

export default function PortalSection({ pacienteId, pacienteNome: pacienteNomeProp, isSearchMode = false, searchFields = {}, onSearchFieldChange }: PortalSectionProps) {
  const [activeTab, setActiveTab] = useState('evolucoes')
  
  // Estados para funcionalidade CRUD de evoluções
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([])
  const [editedEvolucoes, setEditedEvolucoes] = useState<Evolucao[]>([])
  const [isEditingLocal, setIsEditingLocal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [pacienteNome, setPacienteNome] = useState<string>(pacienteNomeProp || '')
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File[]}>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [modalContentType, setModalContentType] = useState<string>('application/pdf')
  const [modalFileName, setModalFileName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  
  // Carregar arquivos existentes  // Buscar avaliação do paciente
  const { data: avaliacaoData, isLoading: loadingAvaliacao, refetch: refetchAvaliacao } = useQuery({
    queryKey: ['avaliacao', pacienteId],
    queryFn: async () => {
      if (!pacienteId) return null
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/avaliacoes/paciente/${pacienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        if (response.status === 404) {
          return null // Não encontrou avaliação para este paciente, o que é normal
        }
        throw new Error(`Erro ao buscar avaliação: ${response.status}`)
      }
      return response.json()
    },
    enabled: activeTab === 'avaliacoes' && !!pacienteId
  })
  
  // Buscar exames do paciente
  const { data: exameData, isLoading: loadingExame, refetch: refetchExame } = useQuery({
    queryKey: ['exame', pacienteId],
    queryFn: async () => {
      if (!pacienteId) return null
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/exames/paciente/${pacienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        if (response.status === 404) {
          return null // Não encontrou exame para este paciente, o que é normal
        }
        throw new Error(`Erro ao buscar exame: ${response.status}`)
      }
      return response.json()
    },
    enabled: activeTab === 'exames' && !!pacienteId
  })

  // Atualizar uploadedFiles quando os dados da avaliação são carregados
  useEffect(() => {
    if (avaliacaoData) {
      const filesFromBackend: {[key: string]: File[]} = {}
      
      // Converter dados do backend para formato de File (mock)
      const categories = ['cardiologista', 'endocrino', 'nutricionista', 'psicologa', 'outros', 'outros2']
      categories.forEach(category => {
        if (avaliacaoData[category] && avaliacaoData[category].length > 0) {
          filesFromBackend[category] = avaliacaoData[category].map((fileData: any) => {
            // Criar um objeto File mock para exibição
            const mockFile = new File([''], fileData.nome_original || 'arquivo', { 
              type: fileData.tipo || 'application/pdf'
            })
            // Definir propriedades adicionais no objeto File
            Object.defineProperty(mockFile, 'size', { value: fileData.tamanho || 0 })
            Object.defineProperty(mockFile, 'nome_arquivo', { value: fileData.nome_arquivo })
            Object.defineProperty(mockFile, 'nome_original', { value: fileData.nome_original })
            return mockFile
          })
        }
      })
      
      setUploadedFiles(filesFromBackend)
    }
  }, [avaliacaoData])
  
  // Atualizar uploadedFiles quando os dados de exames são carregados
  useEffect(() => {
    if (exameData) {
      const filesFromBackend: {[key: string]: File[]} = {}
      
      // Converter dados do backend para formato de File (mock) - campos de exames pré-op
      const categories = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros']
      categories.forEach(category => {
        if (exameData[category] && exameData[category].length > 0) {
          filesFromBackend[category] = exameData[category].map((fileData: any) => {
            // Criar um objeto File mock para exibição
            const mockFile = new File([''], fileData.nome_original || 'arquivo', { 
              type: fileData.tipo || 'application/pdf'
            })
            // Definir propriedades adicionais no objeto File
            Object.defineProperty(mockFile, 'size', { value: fileData.tamanho || 0 })
            Object.defineProperty(mockFile, 'nome_arquivo', { value: fileData.nome_arquivo })
            Object.defineProperty(mockFile, 'nome_original', { value: fileData.nome_original })
            return mockFile
          })
        }
      })
      
      setUploadedFiles(prev => activeTab === 'exames' ? filesFromBackend : prev)
    }
  }, [exameData, activeTab])

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
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/evolucoes?pacienteId=${pacienteId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar evoluções: ${response.status}`);
      }
      
      return await response.json();
    },
    enabled: activeTab === 'evolucoes' && !!pacienteId
  })

  const { data: receitas } = useQuery({
    queryKey: ['receitas', pacienteId],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/receitas/paciente/${pacienteId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar receitas: ${response.status}`);
      }
      
      return await response.json();
    },
    enabled: activeTab === 'receitas'
  })

  // Atualizar nome do paciente quando a prop mudar
  useEffect(() => {
    if (pacienteNomeProp) {
      setPacienteNome(pacienteNomeProp)
      setNewEvolucao(prev => ({
        ...prev,
        nome_paciente: pacienteNomeProp
      }))
    }
  }, [pacienteNomeProp])

  // Atualizar evolucoes quando os dados são buscados
  useEffect(() => {
    if (evolucoesFetched) {
      const evolucoesWithEditState = evolucoesFetched.map((evolucao: Evolucao) => ({
        ...evolucao,
        _editing: false,
        _modified: false
      }))
      setEvolucoes(evolucoesWithEditState)
      setEditedEvolucoes(evolucoesWithEditState)
    }
  }, [evolucoesFetched])


  // Função para lidar com upload de arquivos
  const handleFileUpload = async (files: File[], fieldId: string) => {
    const validTypes = ['application/pdf', 'image/heic', 'image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Arquivo ${file.name} não é um tipo válido. Use PDF, HEIC, JPEG ou PNG.`)
        return false
      }
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande. Máximo 10MB.`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      try {
        // Fazer upload real para o backend
        const formData = new FormData()
        validFiles.forEach(file => {
          formData.append('files', file)
        })
        formData.append('nome_paciente', pacienteNome)

        // Usar a rota de API local para evitar problemas de CORS
        const token = localStorage.getItem('token')
        
        // Determinar a API correta com base no activeTab
        const apiPath = activeTab === 'exames' ? 'exames-preop' : 'avaliacoes'
        
        const response = await fetch(`/api/${apiPath}/upload/${pacienteId}/${fieldId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`Erro ao fazer upload: ${response.status}`)
        }
        
        const data = await response.json()

        // Atualizar estado local com os arquivos enviados
        setUploadedFiles(prev => ({
          ...prev,
          [fieldId]: [...(prev[fieldId] || []), ...validFiles]
        }))
        
        // Recarregar dados da avaliação ou exame para sincronizar com o backend
        if (activeTab === 'avaliacoes') {
          refetchAvaliacao()
        } else if (activeTab === 'exames') {
          refetchExame()
        }
        
        toast.success(`${validFiles.length} arquivo(s) enviado(s) com sucesso para ${fieldId}`)
      } catch (error) {
        console.error('Erro no upload:', error)
        toast.error('Erro ao enviar arquivos. Tente novamente.')
      }
    }
  }

  // Função para abrir arquivo em modal
  const openFile = (fieldId: string, fileName: string) => {
    // Mostrar feedback visual imediato
    toast.info('Carregando arquivo...')
    
    // Definir o nome do arquivo para exibição na modal
    const file = uploadedFiles[fieldId]?.find(f => f.name === fileName || (f as any).nome_arquivo === fileName)
    const displayName = (file as any)?.nome_original || file?.name || fileName
    setModalFileName(displayName)
    
    // Limpar conteúdo anterior e definir estado de carregamento
    setModalContent(null)
    setIsLoading(true)
    
    // Abrir a modal imediatamente para feedback visual
    setIsModalOpen(true)
    
    // Determinar a API correta com base no activeTab
    const apiPath = activeTab === 'exames' ? 'exames' : 'avaliacoes'
    
    // Construir URL para o arquivo usando a rota de API local
    const fileUrl = `/api/${apiPath}/file/${pacienteId}/${fieldId}/${fileName}`
    const token = localStorage.getItem('token')
    
    if (token) {
      // Criar um link temporário com autenticação
      fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar arquivo: ${response.status} ${response.statusText}`)
        }
        // Definir o tipo de conteúdo para renderização correta
        const contentType = response.headers.get('content-type') || 'application/pdf'
        console.log('Content-Type detectado:', contentType)
        setModalContentType(contentType)
        return response.blob()
      })
      .then(blob => {
        const fileUrl = URL.createObjectURL(blob)
        console.log('Blob criado:', { type: blob.type, size: blob.size, fileUrl })
        setModalContent(fileUrl)
        setIsLoading(false) // Desativar indicador de carregamento
      })
      .catch(error => {
        console.error('Erro ao abrir arquivo:', error)
        toast.error(`Erro ao abrir arquivo: ${error.message}`)
        setIsLoading(false) // Desativar indicador de carregamento mesmo em caso de erro
      })
    } else {
      toast.error('Erro de autenticação. Faça login novamente.')
      // Fechar a modal em caso de erro de autenticação
      setIsModalOpen(false)
      setIsLoading(false)
    }
  }

  // Função para remover arquivo
  const removeFile = async (fieldId: string, fileIndex: number) => {
    const file = uploadedFiles[fieldId]?.[fileIndex]
    if (!file) return

    try {
      // Remover arquivo do backend usando a rota de API local
      const token = localStorage.getItem('token')
      
      // Determinar a API correta com base no activeTab
      const apiPath = activeTab === 'exames' ? 'exames-preop' : 'avaliacoes'
      
      const response = await fetch(`/api/${apiPath}/file/${pacienteId}/${fieldId}/${file.name}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao remover arquivo: ${response.status}`)
      }
      
      // Atualizar estado local
      setUploadedFiles(prev => ({
        ...prev,
        [fieldId]: prev[fieldId]?.filter((_, index) => index !== fileIndex) || []
      }))
      
      // Recarregar dados da avaliação ou exame para sincronizar com o backend
      if (activeTab === 'avaliacoes') {
        refetchAvaliacao()
      } else if (activeTab === 'exames') {
        refetchExame()
      }
      
      toast.success('Arquivo removido com sucesso')
    } catch (error) {
      console.error('Erro ao remover arquivo:', error)
      toast.error('Erro ao remover arquivo. Tente novamente.')
    }
  }

  const tabs = [
    { id: 'evolucoes', label: 'EVOLUÇÕES', color: 'bg-filemaker-blue' },
    { id: 'avaliacoes', label: 'AVALIAÇÕES', color: 'bg-filemaker-green' },
    { id: 'exames', label: 'EXAMES PRÉ-OP', color: 'bg-black' },
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

      // Usar a rota de API local para evitar problemas de CORS
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/evolucoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(evolucaoToCreate)
      })
      
      const data = await response.json()
      
      if (data) {
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
      const token = localStorage.getItem('token')
      const promises = editedEvolucoes.map(async (evolucao) => {
        if (evolucao._id) {
          const response = await fetch(`/api/evolucoes/${evolucao._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(evolucao)
          })
          return await response.json()
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
          : (newEvolucao.medicacoes && typeof newEvolucao.medicacoes === 'string' ? (newEvolucao.medicacoes as string).split(',').map((item: string) => item.trim()) : [])
      }

      // Usar a rota de API local para evitar problemas de CORS
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/evolucoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(evolucaoData)
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao criar evolução: ${response.status}`)
      }
      
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
      // Remover do estado local imediatamente para feedback visual
      const updatedEvolucoes = [...evolucoes];
      updatedEvolucoes.splice(index, 1);
      setEvolucoes(updatedEvolucoes);
      setEditedEvolucoes(updatedEvolucoes);
      
      // Enviar requisição para o backend
      const token = localStorage.getItem('token')
      await fetch(`/api/evolucoes/${evolucaoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Recarregar dados do servidor para garantir sincronização
      await refetchEvolucoes()
      toast.success('Evolução deletada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao deletar evolução:', error)
      toast.error(`Erro ao deletar evolução: ${error.message}`)
      // Recarregar dados em caso de erro para restaurar o estado correto
      await refetchEvolucoes()
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
      // Garantir que medicacoes seja sempre um array
      const evolucaoData = {
        ...evolucao,
        medicacoes: Array.isArray(evolucao.medicacoes) 
          ? evolucao.medicacoes 
          : (evolucao.medicacoes && typeof evolucao.medicacoes === 'string' 
              ? (evolucao.medicacoes as string).split(',').map(item => item.trim()) 
              : [])
      }
      
      const token = localStorage.getItem('token')
      await fetch(`/api/evolucoes/${evolucao._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evolucaoData)
      })
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
    
    // Tratamento especial para o campo medicacoes
    if (field === 'medicacoes' && typeof value === 'string') {
      updatedEvolucoes[index] = {
        ...updatedEvolucoes[index],
        [field]: value.split(',').map(item => item.trim())
      }
    } else {
      updatedEvolucoes[index] = {
        ...updatedEvolucoes[index],
        [field]: value
      }
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
          <div className="bg-white border border-gray-300">
            <div className="bg-filemaker-green text-white px-3 py-2 flex justify-between items-center">
              <h3 className="text-sm font-semibold">AVALIAÇÕES</h3>
            </div>

            {/* Campo Nome do Paciente */}
            <div className="p-4 border-b border-gray-200">
              <div className="mb-4">
                <label className="block text-xs font-medium text-filemaker-text mb-1">NOME DO PACIENTE</label>
                <input
                  type="text"
                  value={pacienteNome}
                  readOnly
                  className="filemaker-input w-full text-sm bg-gray-100"
                />
              </div>
            </div>

            {/* Campos de Upload */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'cardiologista', label: 'CARDIOLOGISTA' },
                  { id: 'endocrino', label: 'ENDÓCRINO' },
                  { id: 'nutricionista', label: 'NUTRICIONISTA' },
                  { id: 'psicologa', label: 'PSICÓLOGA' },
                  { id: 'outros', label: 'OUTROS' },
                  { id: 'outros2', label: 'OUTROS 2' }
                ].map((campo) => (
                  <div key={campo.id} className="space-y-2">
                    <label className="block text-xs font-medium text-filemaker-text">
                      {campo.label}
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-filemaker-green transition-colors cursor-pointer"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add('border-filemaker-green', 'bg-green-50')
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-filemaker-green', 'bg-green-50')
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-filemaker-green', 'bg-green-50')
                        const files = Array.from(e.dataTransfer.files)
                        handleFileUpload(files, campo.id)
                      }}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.pdf,.heic,.jpeg,.jpg,.png'
                        input.multiple = true
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || [])
                          handleFileUpload(files, campo.id)
                        }
                        input.click()
                      }}
                    >
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 text-gray-400">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-filemaker-green">Clique para enviar</span> ou arraste arquivos
                        </div>
                        <div className="text-xs text-gray-500">
                          PDF, HEIC, JPEG, PNG (máx. 10MB)
                        </div>
                      </div>
                    </div>
                    
                    {/* Lista de arquivos enviados */}
                    <div className="space-y-1">
                      {uploadedFiles[campo.id]?.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                          <div 
                            className="flex items-center space-x-2 cursor-pointer hover:text-blue-600"
                            onClick={() => openFile(campo.id, (file as any).nome_arquivo || file.name)}
                          >
                            <div className="w-4 h-4 text-gray-500">
                              {((file as any).tipo || file.type || '').includes('pdf') ? (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              ) : (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <span className="truncate max-w-[120px]" title={(file as any).nome_original || file.name}>
                              {(file as any).nome_original || file.name}
                            </span>
                            <span className="text-gray-400">
                              {file.size > 0 ? `(${(file.size / 1024 / 1024).toFixed(1)}MB)` : ''}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(campo.id, index)
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remover arquivo"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'exames':
        return (
          <div className="bg-white border border-gray-300">
            <div className="bg-black text-white px-3 py-2 flex justify-between items-center">
              <h3 className="text-sm font-semibold">EXAMES PRÉ-OP</h3>
            </div>

            {/* Campo Nome do Paciente */}
            <div className="p-4 border-b border-gray-200">
              <div className="mb-4">
                <label className="block text-xs font-medium text-filemaker-text mb-1">NOME DO PACIENTE</label>
                <input
                  type="text"
                  value={pacienteNome}
                  readOnly
                  className="filemaker-input w-full text-sm bg-gray-100"
                />
              </div>
            </div>

            {/* Campos de Upload */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'exames', label: 'EXAMES LABORATORIAIS' },
                  { id: 'usg', label: 'USG' },
                  { id: 'eda', label: 'EDA' },
                  { id: 'rx', label: 'RX DE TÓRAX' },
                  { id: 'ecg', label: 'ECG' },
                  { id: 'eco', label: 'ECOCARDIOGRAMA' },
                  { id: 'polissonografia', label: 'POLISSONOGRAFIA' },
                  { id: 'outros', label: 'OUTROS' }
                ].map((campo) => (
                  <div key={campo.id} className="space-y-2">
                    <label className="block text-xs font-medium text-filemaker-text">
                      {campo.label}
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition-colors cursor-pointer"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add('border-black', 'bg-gray-50')
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-black', 'bg-gray-50')
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-black', 'bg-gray-50')
                        const files = Array.from(e.dataTransfer.files)
                        handleFileUpload(files, campo.id)
                      }}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.pdf,.heic,.jpeg,.jpg,.png'
                        input.multiple = true
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || [])
                          handleFileUpload(files, campo.id)
                        }
                        input.click()
                      }}
                    >
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 text-gray-400">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-black">Clique para enviar</span> ou arraste arquivos
                        </div>
                        <div className="text-xs text-gray-500">
                          PDF, HEIC, JPEG, PNG (máx. 10MB)
                        </div>
                      </div>
                    </div>
                    
                    {/* Lista de arquivos enviados */}
                    <div className="space-y-1">
                      {uploadedFiles[campo.id]?.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                          <div 
                            className="flex items-center space-x-2 cursor-pointer hover:text-blue-600"
                            onClick={() => openFile(campo.id, (file as any).nome_arquivo || file.name)}
                          >
                            <div className="w-4 h-4 text-gray-500">
                              {((file as any).tipo || file.type || '').includes('pdf') ? (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              ) : (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <span className="truncate max-w-[120px]" title={(file as any).nome_original || file.name}>
                              {(file as any).nome_original || file.name}
                            </span>
                            <span className="text-gray-400">
                              {file.size > 0 ? `(${(file.size / 1024 / 1024).toFixed(1)}MB)` : ''}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(campo.id, index)
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remover arquivo"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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

  // Função para fechar a modal
  const closeModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
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
      
      {/* Modal para visualização de arquivos */}
      {isModalOpen && modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold truncate">{modalFileName}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-1 bg-gray-100">
              {modalContent && (
                <div className="bg-gray-200 p-2 flex justify-end">
                  <a 
                    href={modalContent} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Abrir em nova aba
                  </a>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[70vh]">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">Carregando arquivo...</p>
                </div>
              ) : modalContent ? (
                (() => {
                  console.log('Renderizando modal - contentType:', modalContentType, 'isPDF:', modalContentType.includes('pdf'), 'isImage:', modalContentType.includes('image'))
                  return null
                })(),
                modalContentType.includes('pdf') ? (
                  <div className="w-full h-full min-h-[70vh]">
                    {/* Usar PDFViewer para renderização */}
                    <PDFViewer file={modalContent} fileName={modalFileName} />
                    {/* Botões de ação para visualização alternativa */}
                    <div className="bg-gray-100 p-4 border-t border-gray-300 text-center">
                      <p className="text-sm text-gray-600 mb-2">Opções adicionais de visualização:</p>
                      <div className="flex justify-center space-x-3">
                        <a 
                          href={modalContent} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Abrir em nova aba
                        </a>
                        <a 
                          href={modalContent} 
                          download={modalFileName}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Baixar arquivo
                        </a>
                      </div>
                    </div>
                  </div>
                ) : modalContentType.includes('image') ? (
                  <div className="flex items-center justify-center h-full">
                    <img 
                      src={modalContent} 
                      alt={modalFileName} 
                      className="max-w-full max-h-[70vh] object-contain" 
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8 text-center">
                    <div>
                      <p className="mb-4">Este tipo de arquivo não pode ser visualizado diretamente.</p>
                      <a 
                        href={modalContent} 
                        download={modalFileName}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Baixar Arquivo
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-[70vh]">
                  <p className="text-gray-500">Nenhum arquivo selecionado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
