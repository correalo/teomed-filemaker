'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Paciente } from '../types/paciente'
import { applyHeightMask, applyWeightMask, calculateIMC, displayAltura, displayPeso, formatAltura, formatPeso, validateAltura, validatePeso } from "@/utils/formatters";
import { fetchAddressByCep, formatCep, formatPhone, formatCellPhone, formatRG, formatCPF, formatEmail, validateEmail, validateAndFormatCPF } from '../utils/viaCep'
import ConvenioSelect from './ConvenioSelect'
import AudioRecorder from './AudioRecorder'
import PlanoSelect from './PlanoSelect'
import ProfissaoSelect from './ProfissaoSelect'
import StatusSelect from './StatusSelect'
import EmailInput from './EmailInput'
import WhatsAppButton from './WhatsAppButton'
import EmailButton from './EmailButton'
import CPFInput from './CPFInput'
import { BotaoDeletarPaciente } from './BotaoDeletarPaciente'
import { useToast } from './Toast'
import AutocompleteInput from './AutocompleteInput'

interface PacienteCardProps {
  paciente: Paciente
  isSearchMode?: boolean
  searchFields?: any
  onSearchFieldChange?: (field: string, value: string) => void
}

export default function PacienteCard({ paciente: pacienteProp, isSearchMode = false, searchFields = {}, onSearchFieldChange }: PacienteCardProps) {
  const [paciente, setPaciente] = useState<Paciente>(pacienteProp)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPaciente, setEditedPaciente] = useState<Partial<Paciente> | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const toast = useToast()
  
  // Atualizar state local quando prop mudar
  useEffect(() => {
    setPaciente(pacienteProp)
  }, [pacienteProp])
  
  // Log para debug quando paciente mudar
  useEffect(() => {
    console.log('Paciente atualizado:', {
      nome: paciente.nome,
      hasAudio: !!paciente.hma_audio_data,
      audioFilename: paciente.hma_audio_filename,
      transcricao: paciente.hma_transcricao?.substring(0, 50)
    });
  }, [paciente])
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const handleEdit = () => {
    console.log('Ativando modo de edição')
    // Garantir que dados_clinicos exista e que seus campos nunca sejam undefined
    const dadosClinicos = {
      // Primeiro copiamos todos os dados clínicos existentes
      ...(paciente.dados_clinicos || {}),
      // Depois garantimos que os campos críticos tenham valores padrão
      peso: parseFloat(paciente.dados_clinicos?.peso?.toString() || '0') || 0,
      altura: parseFloat(paciente.dados_clinicos?.altura?.toString() || '0') || 0,
      imc: parseFloat(paciente.dados_clinicos?.imc?.toString() || '0') || 0,
      has: paciente.dados_clinicos?.has || false,
      diabetes: paciente.dados_clinicos?.diabetes || false,
      dislipidemia: paciente.dados_clinicos?.dislipidemia || false,
      apneia: paciente.dados_clinicos?.apneia || false,
      artropatias: paciente.dados_clinicos?.artropatias || false,
      ccc: paciente.dados_clinicos?.ccc || false,
      esteatose: paciente.dados_clinicos?.esteatose || false,
      hernia_hiato: paciente.dados_clinicos?.hernia_hiato || false,
      refluxo: paciente.dados_clinicos?.refluxo || false,
      hernia_incisional: paciente.dados_clinicos?.hernia_incisional || false
    }
    
    // Garantir que cirurgia exista e que seus campos nunca sejam undefined
    const cirurgia = {
      // Copiamos todos os dados de cirurgia existentes
      ...(paciente.cirurgia || {}),
      // Garantimos que os campos tenham valores padrão
      data: paciente.cirurgia?.data || '',
      local: paciente.cirurgia?.local || '',
      tratamento: paciente.cirurgia?.tratamento || '',
      tipo: paciente.cirurgia?.tipo || '',
      petersenFechado: paciente.cirurgia?.petersenFechado || false,
      tamanho_alcas: paciente.cirurgia?.tamanho_alcas || '',
      data_segunda_cirurgia: paciente.cirurgia?.data_segunda_cirurgia || '',
      segunda_cirurgia: paciente.cirurgia?.segunda_cirurgia || ''
    }
    
    // Criar um objeto editedPaciente com todos os campos necessários inicializados
    const pacienteParaEdicao = { 
      ...paciente,
      nome: paciente.nome || '',
      prontuario: Number(paciente.prontuario) || 0,
      dados_clinicos: dadosClinicos,
      cirurgia: cirurgia
    };
    
    console.log('EDIÇÃO: Criando editedPaciente com dados:', pacienteParaEdicao);
    console.log('EDIÇÃO: Nome =', pacienteParaEdicao.nome);
    console.log('EDIÇÃO: Prontuário =', pacienteParaEdicao.prontuario);
    
    setEditedPaciente(pacienteParaEdicao)
    
    setIsEditing(true)
    console.log('isEditing após setIsEditing:', true)
  }

  const handleCancel = () => {
    setEditedPaciente(null)
    setIsEditing(false)
  }

  const validateRequired = () => {
    if (!editedPaciente) {
      console.log('VALIDAÇÃO: editedPaciente é null/undefined');
      return false;
    }
    
    console.log('VALIDAÇÃO: Verificando apenas campo nome...');
    console.log('VALIDAÇÃO: editedPaciente.nome =', editedPaciente.nome);
    
    // Validar apenas nome - prontuário pode ser 0 ou vazio
    if (!editedPaciente.nome || (typeof editedPaciente.nome === 'string' && editedPaciente.nome.trim() === '')) {
      console.log('VALIDAÇÃO: Nome está vazio');
      toast.warning('Campo obrigatório: Nome', 4000);
      return false;
    }
    
    console.log('VALIDAÇÃO: Nome preenchido, validação passou');
    return true
  }

  // Função para forçar a saída do modo de edição em qualquer circunstância
  const forceExitEditMode = () => {
    console.log('Forçando saída do modo de edição');
    setIsEditing(false);
    setEditedPaciente(null);
    setIsSaving(false);
    
    // Forçar uma atualização do estado do React
    setTimeout(() => {
      setIsEditing(false);
    }, 50);
  };

  const handleSave = async () => {
    console.log('=== CLIQUE NO BOTÃO SALVAR DETECTADO ===');
    console.log('Estado atual:', { isEditing, isSaving, editedPaciente: !!editedPaciente });
    
    if (!editedPaciente) {
      console.log('ERRO: editedPaciente é null/undefined');
      toast.error('Nenhum dado para salvar');
      return;
    }
    
    if (!validateRequired()) {
      console.log('ERRO: Validação falhou');
      return;
    }
    
    console.log('Validação passou, continuando...');
    
    // Capturar dados antes de qualquer alteração de estado
    const pacienteToSave = {
      ...editedPaciente,
      dados_clinicos: {
        ...(editedPaciente.dados_clinicos || {}),
        peso: parseFloat(editedPaciente.dados_clinicos?.peso?.toString() || '0') || 0,
        altura: parseFloat(editedPaciente.dados_clinicos?.altura?.toString() || '0') || 0,
        imc: parseFloat(editedPaciente.dados_clinicos?.imc?.toString() || '0') || 0
      },
      cirurgia: {
        ...(editedPaciente.cirurgia || {})
      },
      // Garantir que dados do áudio HMA sejam incluídos
      hma_transcricao: editedPaciente.hma_transcricao,
      hma_audio_data: editedPaciente.hma_audio_data,
      hma_audio_type: editedPaciente.hma_audio_type,
      hma_audio_filename: editedPaciente.hma_audio_filename,
      hma_resumo_pdf: editedPaciente.hma_resumo_pdf,
    };
    
    console.log('Dados preparados para salvar:', JSON.stringify(pacienteToSave, null, 2));
    console.log('ID do paciente:', paciente._id);
    
    // Verificar token
    const token = localStorage.getItem('token');
    console.log('Token existe:', !!token);
    console.log('Token (primeiros 20 chars):', token ? token.substring(0, 20) + '...' : 'NENHUM');
    
    if (!token) {
      console.log('ERRO: Token não encontrado');
      toast.error('Sessão expirada. Faça login novamente.');
      return;
    }
    
    const url = `/api/pacientes/${paciente._id}`;
    console.log('URL da requisição:', url);
    
    try {
      console.log('Iniciando requisição PATCH...');
      
      // Fazer requisição ao backend
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pacienteToSave)
      });
      
      console.log('Resposta recebida - Status:', response.status);
      console.log('Resposta recebida - OK:', response.ok);
      
      if (response.ok) {
        console.log('SUCESSO: Dados salvos no servidor');
        
        // Pegar dados atualizados do servidor
        const updatedPaciente = await response.json();
        console.log('Dados recebidos do servidor:', updatedPaciente);
        
        // Atualizar estado local com resposta do servidor
        setPaciente(updatedPaciente);
        console.log('Estado local atualizado com setPaciente');
        
        // Sair do modo de edição
        setIsEditing(false);
        setEditedPaciente(null);
        console.log('Saindo do modo de edição');
        
        toast.success('Dados salvos com sucesso!');
        
        // Não precisa mais recarregar a página
        console.log('Atualização concluída sem reload');
      } else {
        const errorText = await response.text();
        console.error('ERRO do servidor:', response.status, errorText);
        toast.error(`Erro ao salvar: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('ERRO na requisição:', error);
      toast.error(`Erro de conexão: ${error.message}`);
    }
    
    console.log('=== FIM DO PROCESSO DE SALVAMENTO ===');
  }

  const handleAudioRecording = async (audioBlob: Blob) => {
    if (!paciente._id) {
      toast.error('ID do paciente não encontrado')
      return
    }

    setIsUploadingAudio(true)
    const token = localStorage.getItem('token')

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch(`http://localhost:3004/pacientes/${paciente._id}/hma/audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Áudio recebido:', {
          filename: result.audioFilename,
          type: result.audioType,
          transcricao: result.transcricao,
          dataLength: result.audioData?.length
        })
        
        toast.success('Áudio transcrito com sucesso!')
        
        // Atualizar dados do áudio no estado
        const audioType = result.audioType || 'audio/mp3';
        
        handleInputChange('hma_transcricao', result.transcricao || '')
        handleInputChange('hma_audio_data', result.audioData || '')
        handleInputChange('hma_audio_type', audioType)
        handleInputChange('hma_audio_filename', result.audioFilename || '')
        
        // Também atualizar o paciente local
        setPaciente({
          ...paciente,
          hma_transcricao: result.transcricao || '',
          hma_audio_data: result.audioData || '',
          hma_audio_type: audioType,
          hma_audio_filename: result.audioFilename || ''
        })
      } else {
        const error = await response.text()
        toast.error(`Erro ao enviar áudio: ${error}`)
      }
    } catch (error: any) {
      console.error('Erro ao enviar áudio:', error)
      toast.error(`Erro ao enviar áudio: ${error.message}`)
    } finally {
      setIsUploadingAudio(false)
    }
  }

  const handlePdfUpload = async (file: File) => {
    if (!paciente._id) {
      toast.error('ID do paciente não encontrado')
      return
    }

    setIsUploadingPdf(true)
    const token = localStorage.getItem('token')

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch(`http://localhost:3004/pacientes/${paciente._id}/hma/pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('PDF enviado com sucesso!')
        
        // Atualizar PDF no estado usando handleInputChange para garantir que salve
        handleInputChange('hma_resumo_pdf', result.filename)
        
        // Também atualizar o paciente local
        setPaciente({
          ...paciente,
          hma_resumo_pdf: result.filename
        })
      } else {
        const error = await response.text()
        toast.error(`Erro ao enviar PDF: ${error}`)
      }
    } catch (error: any) {
      console.error('Erro ao enviar PDF:', error)
      toast.error(`Erro ao enviar PDF: ${error.message}`)
    } finally {
      setIsUploadingPdf(false)
    }
  }

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleInputChange = (field: string, value: any) => {
    if (!editedPaciente) return
    
    // Aplicar trim e maiúsculo apenas no campo nome
    let processedValue = field === 'nome' ? value.trim().toUpperCase() : value
    
    const fieldParts = field.split('.')
    if (fieldParts.length === 1) {
      const newPaciente = { ...editedPaciente, [field]: processedValue }
      
      // Se mudou a data de nascimento, calcular idade automaticamente
      if (field === 'dataNascimento' && processedValue) {
        newPaciente.idade = calculateAge(processedValue)
      }
      
      setEditedPaciente(newPaciente)
    } else if (fieldParts.length === 2) {
      const [parentField, childField] = fieldParts
      const parentObject = editedPaciente[parentField as keyof Paciente] || {}
      
      // Converter valores numéricos para dados_clinicos
      if (parentField === 'dados_clinicos') {
        if (childField === 'peso' || childField === 'altura' || childField === 'imc') {
          // Converter string para número
          processedValue = parseFloat(processedValue) || 0
        }
      }
      
      // Criar o novo objeto paciente com o campo atualizado
      const newEditedPaciente = {
        ...editedPaciente,
        [parentField]: {
          ...(typeof parentObject === 'object' ? parentObject : {}),
          [childField]: processedValue
        }
      }
      
      // Calcular o IMC automaticamente se peso ou altura foram alterados
      if (parentField === 'dados_clinicos' && (childField === 'peso' || childField === 'altura')) {
        const dadosClinicos = newEditedPaciente.dados_clinicos || {}
        // Definindo o tipo para evitar erro de propriedade não existente
        const dadosClinicosTyped = dadosClinicos as { 
          peso?: string | number, 
          altura?: string | number, 
          imc?: string | number,
          alergias?: string[],
          has?: boolean,
          diabetes?: boolean,
          tabagismo?: boolean,
          etilismo?: boolean,
          dislipidemia?: boolean,
          medicamento?: string,
          dosagem?: string
        }
        const peso = dadosClinicosTyped.peso?.toString() || ''
        const altura = dadosClinicosTyped.altura?.toString() || ''
        
        if (peso && altura) {
          const imc = calculateIMC(peso, altura)
          // Converte o IMC para número para evitar erro de tipo
          const imcNumber = parseFloat(imc)
          
          // Usa type assertion para evitar erros de tipo
          // Isso é seguro porque estamos apenas atualizando o IMC mantendo os outros campos
          const updatedDadosClinicos = {
            ...dadosClinicos,
            imc: imcNumber
          }
          
          // Atribui os dados clínicos atualizados usando type assertion
          newEditedPaciente.dados_clinicos = updatedDadosClinicos as any
          console.log('IMC calculado:', imc, 'Peso:', peso, 'Altura:', altura)
        }
      }
      
      setEditedPaciente(newEditedPaciente)
    } else if (fieldParts.length === 3) {
      const [parentField, middleField, childField] = fieldParts
      const parentObject = editedPaciente[parentField as keyof Paciente] || {}
      const middleObject = (parentObject as any)?.[middleField] || {}
      setEditedPaciente({
        ...editedPaciente,
        [parentField]: {
          ...(typeof parentObject === 'object' ? parentObject : {}),
          [middleField]: {
            ...middleObject,
            [childField]: processedValue
          }
        }
      })
    }
  }

  if (!paciente) {
    return (
      <div className="filemaker-card p-6">
        <div className="text-center text-gray-500">
          Carregando dados do paciente...
        </div>
      </div>
    )
  }

  const currentData = isEditing ? editedPaciente : paciente
  
  // Log para depuração
  console.log('Estado atual:', { isEditing, isSearchMode })

  return (
    <div className="filemaker-card p-3 sm:p-4 lg:p-6">
      {/* Action Buttons - Responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {isSearchMode ? (
            <div className="bg-orange-100 text-orange-800 px-3 py-2 sm:px-4 sm:py-2 rounded text-sm sm:text-base flex-1 sm:flex-none font-medium">
              🔍 Modo Busca - Digite nos campos para filtrar
            </div>
          ) : !isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-filemaker-blue text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-blue-600 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
            >
              ✏️ Editar
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-gray-600 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
              >
                ❌ Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-none"
              >
                {isSaving ? '⏳ Salvando...' : '💾 Salvar'}
              </button>
            </>
          )}
        </div>
        
        {!isSearchMode && (
          <div className="w-full sm:w-auto flex justify-end">
            <BotaoDeletarPaciente paciente={paciente} />
          </div>
        )}
      </div>

      {/* Header with patient basic info - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block text-xs font-medium text-filemaker-text mb-1">NOME</label>
          {isSearchMode ? (
            <AutocompleteInput
              value={searchFields.nome || ''}
              onChange={(value) => onSearchFieldChange?.('nome', value)}
              placeholder="Buscar por nome..."
              className={`filemaker-input w-full text-sm sm:text-base bg-orange-50 border-orange-300 focus:border-orange-500`}
              apiEndpoint="/api/pacientes/autocomplete/nomes"
            />
          ) : (
            <input
              type="text"
              value={isEditing ? (editedPaciente?.nome || '') : (paciente?.nome || '')}
              readOnly={!isEditing}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={`filemaker-input w-full text-sm sm:text-base ${
                !editedPaciente?.nome && isEditing ? 'border-red-500' : ''
              }`}
              style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
            />
          )}
          {isEditing && !currentData?.nome && (
            <div className="text-red-500 text-xs mt-1">Campo obrigatório</div>
          )}
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">DATA NASCIMENTO</label>
          <input
            type="date"
            value={isSearchMode ? (searchFields.dataNascimento || '') : (currentData?.dataNascimento || '')}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('dataNascimento', e.target.value)
              } else {
                handleInputChange('dataNascimento', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">IDADE</label>
          <input
            type="number"
            value={isSearchMode ? (searchFields.idade || '') : (isEditing ? (editedPaciente?.idade || '') : (currentData?.idade || ''))}
            readOnly={!isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('idade', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : 'bg-gray-100'
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : '#f9f9f9' }}
            placeholder={isSearchMode ? "Buscar por idade..." : ""}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">SEXO</label>
          <select
            value={isSearchMode ? (searchFields.sexo || '') : (currentData?.sexo || '')}
            disabled={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('sexo', e.target.value)
              } else {
                handleInputChange('sexo', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
          >
            <option value="">{isSearchMode ? "Buscar por sexo..." : "Selecione"}</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="O">Outro</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">DATA 1ª CONSULTA</label>
          <input
            type="date"
            value={isSearchMode ? (searchFields.dataPrimeiraConsulta || '') : (isEditing ? (editedPaciente?.dataPrimeiraConsulta || '') : (currentData?.dataPrimeiraConsulta || ''))}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('dataPrimeiraConsulta', e.target.value)
              } else {
                handleInputChange('dataPrimeiraConsulta', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">INDICAÇÃO</label>
          <input
            type="text"
            value={isSearchMode ? (searchFields.indicacao || '') : (currentData?.indicacao || '')}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('indicacao', e.target.value)
              } else {
                const value = e.target.value
                const capitalizedValue = value.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')
                handleInputChange('indicacao', capitalizedValue)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            placeholder={isSearchMode ? "Buscar por indicação..." : ""}
          />
        </div>
      </div>

      {/* Address and Contact - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block text-xs font-medium text-filemaker-text mb-1">LOGRADOURO</label>
          <input
            type="text"
            value={isSearchMode ? (searchFields.logradouro || '') : (currentData?.endereco?.normalizado?.logradouro || '')}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('logradouro', e.target.value)
              } else {
                handleInputChange('endereco.normalizado.logradouro', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            placeholder={isSearchMode ? "Buscar por logradouro..." : ""}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">NÚMERO</label>
          <input
            type="text"
            value={isSearchMode ? (searchFields.numero || '') : (currentData?.endereco?.normalizado?.numero || '')}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('numero', e.target.value)
              } else {
                handleInputChange('endereco.normalizado.numero', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            placeholder={isSearchMode ? "Buscar por número..." : ""}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">COMPLEMENTO</label>
          <input
            type="text"
            value={isSearchMode ? (searchFields.complemento || '') : (currentData?.endereco?.normalizado?.complemento || '')}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('complemento', e.target.value)
              } else {
                handleInputChange('endereco.normalizado.complemento', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            placeholder={isSearchMode ? "Buscar por complemento..." : ""}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CEP</label>
          <input
            type="text"
            value={isSearchMode ? (searchFields.cep || '') : (isEditing ? (editedPaciente?.endereco?.cep || '') : (currentData?.endereco?.cep || ''))}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('cep', e.target.value)
              } else {
                const value = e.target.value
                const formattedCep = formatCep(value)
                
                // Atualizar o CEP imediatamente
                handleInputChange('endereco.cep', formattedCep)
                
                // Se CEP está completo (8 dígitos), busca endereço
                const cleanCep = formattedCep.replace(/\D/g, '')
                
                if (cleanCep.length === 8 && isEditing) {
                // Usar setTimeout maior para garantir que o input seja atualizado primeiro
                setTimeout(async () => {
                  try {
                    const response = await fetch(`/api/viacep/${cleanCep}/json/`)
                    if (response.ok) {
                      const addressData = await response.json()
                      if (addressData && !addressData.erro) {
                        // Atualizar apenas os campos de endereço, não o CEP
                        if (editedPaciente) {
                          setEditedPaciente(prev => ({
                            ...prev!,
                            endereco: {
                              ...prev!.endereco,
                              completo: prev!.endereco?.completo || '',
                              cep: prev!.endereco?.cep || '',
                              normalizado: {
                                ...prev!.endereco?.normalizado,
                                logradouro: addressData.logradouro || '',
                                bairro: addressData.bairro || '',
                                cidade: addressData.localidade || '',
                                estado: addressData.uf || '',
                                numero: prev!.endereco?.normalizado?.numero || '',
                                complemento: prev!.endereco?.normalizado?.complemento || ''
                              }
                            }
                          }))
                        }
                      }
                    }
                  } catch (error) {
                    console.error('Erro ao buscar CEP:', error)
                  }
                }, 300)
                }
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            maxLength={9}
            placeholder={isSearchMode ? "Buscar por CEP..." : "00000-000"}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">BAIRRO</label>
          <input
            type="text"
            value={isSearchMode ? (searchFields.bairro || '') : (() => {
              const complemento = currentData?.endereco?.normalizado?.complemento || '';
              // Extrair "Vila Lais - Penha" do complemento completo
              if (complemento.includes(' - ')) {
                const parts = complemento.split(' - ');
                if (parts.length >= 2) {
                  return `${parts[0]} - ${parts[1]}`; // "Vila Lais - Penha"
                }
              }
              return currentData?.endereco?.normalizado?.bairro || '';
            })()}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('bairro', e.target.value)
              } else {
                handleInputChange('endereco.normalizado.bairro', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            placeholder={isSearchMode ? "Buscar por bairro..." : ""}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CIDADE</label>
          <input
            type="text"
            value={isSearchMode ? (searchFields.cidade || '') : (currentData?.endereco?.normalizado?.cidade || '')}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('cidade', e.target.value)
              } else {
                handleInputChange('endereco.normalizado.cidade', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            placeholder={isSearchMode ? "Buscar por cidade..." : ""}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">ESTADO</label>
          <input
            type="text"
            value={isSearchMode ? (searchFields.estado || '') : (currentData?.endereco?.normalizado?.estado || '')}
            readOnly={!isEditing && !isSearchMode}
            onChange={(e) => {
              if (isSearchMode) {
                onSearchFieldChange?.('estado', e.target.value)
              } else {
                handleInputChange('endereco.normalizado.estado', e.target.value)
              }
            }}
            className={`filemaker-input w-full text-sm sm:text-base ${
              isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
            }`}
            style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            placeholder={isSearchMode ? "Buscar por estado..." : ""}
          />
        </div>
      </div>

      {/* Contact, Insurance and Documents - Responsivo */}
      <div className="space-y-4 mb-4 sm:mb-6">
        {/* Linha 1: Contato */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-filemaker-text mb-1">TELEFONE</label>
            <input
              type="text"
              value={isSearchMode ? (searchFields.telefone || '') : (currentData?.contato?.telefone || '')}
              readOnly={!isEditing && !isSearchMode}
              onChange={(e) => {
                if (isSearchMode) {
                  onSearchFieldChange?.('telefone', e.target.value)
                } else {
                  const formattedPhone = formatPhone(e.target.value)
                  handleInputChange('contato.telefone', formattedPhone)
                }
              }}
              className={`filemaker-input w-full text-sm sm:text-base ${
                isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
              }`}
              style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
              placeholder={isSearchMode ? "Buscar por telefone..." : "(00) 0000-0000"}
              maxLength={14}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-filemaker-text mb-1">CELULAR</label>
            <div className="relative">
              <input
                type="text"
                value={isSearchMode ? (searchFields.celular || '') : (currentData?.contato?.celular || '')}
                readOnly={!isEditing && !isSearchMode}
                onChange={(e) => {
                  if (isSearchMode) {
                    onSearchFieldChange?.('celular', e.target.value)
                  } else {
                    const formattedCellPhone = formatCellPhone(e.target.value)
                    handleInputChange('contato.celular', formattedCellPhone)
                  }
                }}
                className={`filemaker-input w-full pr-12 text-sm sm:text-base ${
                  isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                }`}
                style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                placeholder={isSearchMode ? "Buscar por celular..." : "(00) 00000-0000"}
                maxLength={15}
              />
              <div className="absolute inset-y-0 right-1 flex items-center">
                <WhatsAppButton phoneNumber={currentData?.contato?.celular || ''} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-filemaker-text mb-1">PROFISSÃO</label>
            <ProfissaoSelect
              value={isSearchMode ? (searchFields.profissao || '') : (currentData?.profissao || '')}
              onChange={(value) => {
                if (isSearchMode) {
                  onSearchFieldChange?.('profissao', value)
                } else {
                  handleInputChange('profissao', value)
                }
              }}
              readOnly={!isEditing && !isSearchMode}
              className={`filemaker-input w-full text-sm sm:text-base ${
                isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
              }`}
              style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-filemaker-text mb-1">EMAIL</label>
            <div className="relative">
              <EmailInput
                value={isSearchMode ? (searchFields.email || '') : (currentData?.contato?.email || '')}
                onChange={(value) => {
                  if (isSearchMode) {
                    onSearchFieldChange?.('email', value)
                  } else {
                    handleInputChange('contato.email', value)
                  }
                }}
                readOnly={!isEditing && !isSearchMode}
                className={`filemaker-input w-full pr-12 text-sm sm:text-base ${
                  isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                }`}
                style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                showValidation={isEditing && !isSearchMode}
                placeholder={isSearchMode ? "Buscar por email..." : ""}
              />
              <div className="absolute inset-y-0 right-1 flex items-center">
                <EmailButton email={currentData?.contato?.email || ''} />
              </div>
            </div>
          </div>
        </div>

        {/* Linha 2: Convênio e Documentos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-3 sm:gap-4">
          <div className="md:col-span-2 lg:col-span-3 relative">
            <label className="block text-xs font-medium text-filemaker-text mb-1">CONVÊNIO</label>
            {isEditing && !isSearchMode ? (
              <ConvenioSelect
                value={currentData?.convenio?.nome || ''}
                onChange={(value) => handleInputChange('convenio.nome', value)}
                readOnly={false}
                className="filemaker-input w-full text-sm sm:text-base"
                style={{ backgroundColor: '#fff' }}
              />
            ) : (
              <input
                type="text"
                value={isSearchMode ? (searchFields.convenio || '') : (currentData?.convenio?.nome || '')}
                readOnly={!isEditing && !isSearchMode}
                onChange={(e) => {
                  if (isSearchMode) {
                    onSearchFieldChange?.('convenio', e.target.value)
                  } else {
                    handleInputChange('convenio.nome', e.target.value)
                  }
                }}
                className={`filemaker-input w-full text-sm sm:text-base ${
                  isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                }`}
                style={{ backgroundColor: isSearchMode ? '#fef3e2' : '#f9f9f9' }}
                placeholder={isSearchMode ? "Buscar por convênio..." : ""}
              />
            )}
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            <label className="block text-xs font-medium text-filemaker-text mb-1">STATUS</label>
            <StatusSelect
              value={isSearchMode ? (searchFields.status || '') : (currentData?.status || '')}
              onChange={(value) => {
                if (isSearchMode) {
                  onSearchFieldChange?.('status', value)
                } else {
                  handleInputChange('status', value)
                }
              }}
              readOnly={!isEditing && !isSearchMode}
              className={`filemaker-input w-full text-sm sm:text-base ${
                isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
              }`}
              style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-filemaker-text mb-1">CARTEIRINHA</label>
            <input
              type="text"
              value={isSearchMode ? (searchFields.carteirinha || '') : (paciente.convenio?.carteirinha || '')}
              readOnly={!isSearchMode}
              onChange={(e) => {
                if (isSearchMode) {
                  onSearchFieldChange?.('carteirinha', e.target.value)
                }
              }}
              className={`filemaker-input w-full text-sm sm:text-base ${
                isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
              }`}
              style={{ backgroundColor: isSearchMode ? '#fef3e2' : '#f9f9f9' }}
              placeholder={isSearchMode ? "Buscar por carteirinha..." : ""}
            />
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            <label className="block text-xs font-medium text-filemaker-text mb-1">PLANO</label>
            {isEditing && !isSearchMode ? (
              <PlanoSelect
                value={currentData?.convenio?.plano || ''}
                onChange={(value) => handleInputChange('convenio.plano', value)}
                readOnly={false}
                className="filemaker-input w-full text-sm sm:text-base"
                style={{ backgroundColor: '#fff' }}
              />
            ) : (
              <input
                type="text"
                value={isSearchMode ? (searchFields.plano || '') : (currentData?.convenio?.plano || '')}
                readOnly={!isEditing && !isSearchMode}
                onChange={(e) => {
                  if (isSearchMode) {
                    onSearchFieldChange?.('plano', e.target.value)
                  } else {
                    handleInputChange('convenio.plano', e.target.value)
                  }
                }}
                className={`filemaker-input w-full text-sm sm:text-base ${
                  isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                }`}
                style={{ backgroundColor: isSearchMode ? '#fef3e2' : '#f9f9f9' }}
                placeholder={isSearchMode ? "Buscar por plano..." : ""}
              />
            )}
          </div>
          <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
            <label className="block text-xs font-medium text-filemaker-text mb-1">RG</label>
            <input
              type="text"
              value={isSearchMode ? (searchFields.rg || '') : (currentData?.documentos?.rg || '')}
              readOnly={!isEditing && !isSearchMode}
              onChange={(e) => {
                if (isSearchMode) {
                  onSearchFieldChange?.('rg', e.target.value)
                } else {
                  const formattedRG = formatRG(e.target.value)
                  handleInputChange('documentos.rg', formattedRG)
                }
              }}
              className={`filemaker-input w-full text-sm sm:text-base ${
                isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
              }`}
              style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
              placeholder={isSearchMode ? "Buscar por RG..." : "00.000.000-0"}
              maxLength={12}
            />
          </div>
          <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
            <label className="block text-xs font-medium text-filemaker-text mb-1">CPF</label>
            <CPFInput
              value={isSearchMode ? (searchFields.cpf || '') : (currentData?.documentos?.cpf || '')}
              onChange={(value) => {
                if (isSearchMode) {
                  onSearchFieldChange?.('cpf', value)
                } else {
                  handleInputChange('documentos.cpf', value)
                }
              }}
              readOnly={!isEditing && !isSearchMode}
              className={`filemaker-input w-full text-sm sm:text-base ${
                isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
              }`}
              style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
              showValidation={!isSearchMode}
              placeholder={isSearchMode ? "Buscar por CPF..." : ""}
            />
          </div>
        </div>
      </div>

      {/* Clinical Data and Antecedents - Only show in normal mode */}
      {!isSearchMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* HMA Section */}
          <div className="lg:col-span-1">
            <div className="filemaker-section">
              <h3 className="text-sm font-semibold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
                HMA
              </h3>
              <div className="space-y-3">
                {/* Gravação de Áudio */}
                <div>
                  <label className="block text-xs text-filemaker-text mb-1">GRAVAÇÃO DE ÁUDIO</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AudioRecorder
                        onRecordingComplete={handleAudioRecording}
                        disabled={!isEditing || isUploadingAudio}
                      />
                      {isUploadingAudio && (
                        <span className="text-xs text-blue-600">Transcrevendo...</span>
                      )}
                    </div>
                    {/* Player de Áudio */}
                    {(isEditing ? editedPaciente?.hma_audio_data : paciente.hma_audio_data) && (() => {
                      const audioData = isEditing ? editedPaciente?.hma_audio_data : paciente.hma_audio_data;
                      const audioType = isEditing ? editedPaciente?.hma_audio_type : paciente.hma_audio_type;
                      const audioFilename = isEditing ? editedPaciente?.hma_audio_filename : paciente.hma_audio_filename;
                      
                      // Criar URL única com hash dos primeiros 100 chars do base64 para forçar reload
                      const audioHash = audioData?.substring(0, 100) || '';
                      const uniqueKey = `${audioFilename}-${audioHash.length}`;
                      
                      console.log('Renderizando player:', { 
                        audioFilename, 
                        audioType, 
                        hasData: !!audioData,
                        dataLength: audioData?.length,
                        uniqueKey 
                      });
                      
                      return (
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-600">
                              🎵 {audioFilename || 'audio.mp3'}
                            </span>
                          </div>
                          <audio 
                            controls 
                            className="w-full" 
                            style={{height: '32px'}} 
                            key={uniqueKey}
                            src={`data:${audioType || 'audio/mp3'};base64,${audioData}`}
                          >
                            Seu navegador não suporta o elemento de áudio.
                          </audio>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Transcrição */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-filemaker-text">TRANSCRIÇÃO</label>
                    {(isEditing ? editedPaciente?.hma_transcricao : paciente.hma_transcricao) && (
                      <button
                        type="button"
                        onClick={() => {
                          const transcricao = isEditing ? editedPaciente?.hma_transcricao : paciente.hma_transcricao;
                          const blob = new Blob([transcricao || ''], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `transcricao-hma-${paciente.nome}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success('Transcrição baixada!');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        📄 Baixar TXT
                      </button>
                    )}
                  </div>
                  <textarea
                    className={`w-full px-2 py-2 text-sm rounded border min-h-[100px] ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'}`}
                    placeholder="A transcrição do áudio aparecerá aqui automaticamente..."
                    readOnly={!isEditing}
                    value={(isEditing ? (editedPaciente?.hma_transcricao || '') : (paciente.hma_transcricao || ''))}
                    onChange={(e) => handleInputChange('hma_transcricao', e.target.value)}
                  />
                </div>

                {/* Upload de PDF do Resumo */}
                <div>
                  <label className="block text-xs text-filemaker-text mb-1">RESUMO DO HMA (PDF)</label>
                  <div className="space-y-2">
                    {isEditing && (
                      <div className="w-full">
                        <input
                          type="file"
                          accept=".pdf"
                          disabled={isUploadingPdf}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-filemaker-blue file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handlePdfUpload(file)
                              e.target.value = '' // Reset input
                            }
                          }}
                        />
                        {isUploadingPdf && (
                          <span className="text-xs text-blue-600">Enviando PDF...</span>
                        )}
                      </div>
                    )}
                    {(isEditing ? editedPaciente?.hma_resumo_pdf : paciente.hma_resumo_pdf) && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-2 rounded border border-gray-200 gap-2">
                        <span className="text-xs text-gray-700 truncate flex-1 min-w-0">
                          📄 {isEditing ? editedPaciente?.hma_resumo_pdf : paciente.hma_resumo_pdf}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 whitespace-nowrap"
                            title="Visualizar PDF"
                            onClick={() => setShowPdfModal(true)}
                          >
                            👁️ Ver
                          </button>
                          {isEditing && (
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 whitespace-nowrap"
                              title="Remover PDF"
                              onClick={() => handleInputChange('hma_resumo_pdf', '')}
                            >
                              🗑️ Remover
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Evaluation */}
          <div className="lg:col-span-1">
            <div className="filemaker-section">
              <h3 className="text-sm font-semibold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
                AVALIAÇÃO CLÍNICA
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-filemaker-text mb-1">PESO</label>
                    <div className="flex items-stretch">
                      <div className="flex-grow">
                        {isEditing ? (
                          <input
                            type="text"
                            className="bg-white w-full rounded-l font-mono"
                            defaultValue={applyWeightMask(editedPaciente?.dados_clinicos?.peso)}
                            onChange={(e) => {
                              // Pega apenas os dígitos da entrada (sem ponto)
                              const inputValue = e.target.value.replace(/[^0-9]/g, '')
                              
                              // Aplica a máscara para exibição
                              const masked = applyWeightMask(inputValue)
                              e.target.value = masked
                              
                              // Posiciona o cursor após o último dígito ou após o ponto se não houver dígitos
                              const cursorPos = masked.lastIndexOf('.') + 2
                              e.target.setSelectionRange(cursorPos, cursorPos)
                              
                              // Formata o valor para armazenamento com ponto decimal
                              let formattedValue = ''
                              if (inputValue.length > 0) {
                                const intPart = inputValue.slice(0, -1) || '0'
                                const decPart = inputValue.slice(-1)
                                formattedValue = `${intPart}.${decPart}`
                              }
                              
                              const validation = validatePeso(formattedValue)
                              
                              if (!validation.isValid && formattedValue) {
                                setValidationErrors(prev => ({ ...prev, peso: validation.message || '' }))
                              } else {
                                setValidationErrors(prev => ({ ...prev, peso: '' }))
                              }
                              
                              // Converter para número antes de passar para handleInputChange
                              handleInputChange('dados_clinicos.peso', formattedValue)
                            }}
                            onFocus={(e) => {
                              // Posiciona o cursor no final do texto
                              const val = e.target.value
                              e.target.value = ''
                              e.target.value = val
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            className="bg-gray-100 cursor-not-allowed w-full rounded-l"
                            value={displayPeso(paciente.dados_clinicos?.peso?.toString() || '')}
                            readOnly
                          />
                        )}
                      </div>
                      <span className="bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-r border border-l-0 border-gray-300 flex items-center font-medium whitespace-nowrap">
                        kg
                      </span>
                    </div>
                    {validationErrors.peso && (
                      <div className="text-red-500 text-xs mt-1">{validationErrors.peso}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-filemaker-text mb-1">ALTURA</label>
                    <div className="flex items-stretch">
                      <div className="flex-grow">
                        {isEditing ? (
                          <input
                            type="text"
                            name="altura"
                            id="altura"
                            className="bg-white w-full rounded-l font-mono"
                            defaultValue={applyHeightMask(editedPaciente?.dados_clinicos?.altura)}
                            onChange={(e) => {
                              // Pega apenas os dígitos da entrada (sem ponto)
                              const inputValue = e.target.value.replace(/[^0-9]/g, '')
                              
                              // Aplica a máscara para exibição
                              const masked = applyHeightMask(inputValue)
                              e.target.value = masked
                              
                              // Posiciona o cursor após o último dígito ou após o ponto se não houver dígitos
                              const cursorPos = masked.lastIndexOf(inputValue.slice(-1))
                              if (cursorPos >= 0) {
                                e.target.setSelectionRange(cursorPos + 1, cursorPos + 1)
                              } else {
                                e.target.setSelectionRange(2, 2) // Posiciona após o ponto
                              }
                              
                              // Formata o valor para armazenamento (com ponto decimal)
                              let formattedValue = ''
                              
                              if (inputValue) {
                                if (inputValue.length === 1) {
                                  formattedValue = `0.${inputValue}0`
                                } else if (inputValue.length === 2) {
                                  formattedValue = `0.${inputValue}`
                                } else {
                                  const intPart = inputValue.slice(0, -2) || '0'
                                  const decPart = inputValue.slice(-2)
                                  formattedValue = `${intPart}.${decPart}`
                                }
                              }
                              
                              // Normaliza valores como 81.78 para 1.78
                              const numValue = parseFloat(formattedValue)
                              if (numValue > 10) {
                                formattedValue = (numValue / 100).toFixed(2)
                              }
                              
                              // Validação
                              const validation = validateAltura(formattedValue)
                              if (!validation.isValid) {
                                setValidationErrors(prev => ({ ...prev, altura: validation.message || '' }))
                              } else {
                                setValidationErrors(prev => ({ ...prev, altura: '' }))
                              }
                              
                              // Converter para número antes de passar para handleInputChange
                              handleInputChange('dados_clinicos.altura', formattedValue)
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            className="bg-gray-100 cursor-not-allowed w-full rounded-l"
                            value={displayAltura(paciente.dados_clinicos?.altura?.toString() || '')}
                            readOnly
                          />
                        )}
                      </div>
                      <span className="bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-r border border-l-0 border-gray-300 flex items-center font-medium whitespace-nowrap">
                        m
                      </span>
                    </div>
                    {validationErrors.altura && (
                      <div className="text-red-500 text-xs mt-1">{validationErrors.altura}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-filemaker-text mb-1">IMC</label>
                    <div className="flex items-stretch">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={isEditing 
                            ? (editedPaciente?.dados_clinicos?.imc || calculateIMC(
                                editedPaciente?.dados_clinicos?.peso?.toString() || '', 
                                editedPaciente?.dados_clinicos?.altura?.toString() || ''
                              ) || '') 
                            : (paciente.dados_clinicos?.imc || calculateIMC(
                                paciente.dados_clinicos?.peso?.toString() || '', 
                                paciente.dados_clinicos?.altura?.toString() || ''
                              ) || '')}
                          readOnly={true}
                          className="filemaker-input w-full text-sm rounded-l"
                          style={{ backgroundColor: '#f0f0f0', color: '#666' }}
                          placeholder="Calculado automaticamente"
                        />
                      </div>
                      <span className="bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-r border border-l-0 border-gray-300 flex items-center font-medium whitespace-nowrap">
                        kg/m²
                      </span>
                    </div>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.has || false) : (paciente.dados_clinicos?.has || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.has', e.target.checked)}
                  />
                  <span>HAS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.diabetes || false) : (paciente.dados_clinicos?.diabetes || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.diabetes', e.target.checked)}
                  />
                  <span>DIABETES</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.dislipidemia || false) : (paciente.dados_clinicos?.dislipidemia || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.dislipidemia', e.target.checked)}
                  />
                  <span>DISLIPIDEMIA</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.apneia || false) : (paciente.dados_clinicos?.apneia || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.apneia', e.target.checked)}
                  />
                  <span>APNÉIA</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.artropatias || false) : (paciente.dados_clinicos?.artropatias || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.artropatias', e.target.checked)}
                  />
                  <span>ARTROPATIAS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.ccc || false) : (paciente.dados_clinicos?.ccc || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.ccc', e.target.checked)}
                  />
                  <span>CCC</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.esteatose || false) : (paciente.dados_clinicos?.esteatose || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.esteatose', e.target.checked)}
                  />
                  <span>ESTEATOSE</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.hernia_hiato || false) : (paciente.dados_clinicos?.hernia_hiato || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.hernia_hiato', e.target.checked)}
                  />
                  <span>HÉRNIA DE HIATO</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.refluxo || false) : (paciente.dados_clinicos?.refluxo || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.refluxo', e.target.checked)}
                  />
                  <span>REFLUXO</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.hernia_incisional || false) : (paciente.dados_clinicos?.hernia_incisional || false)} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.hernia_incisional', e.target.checked)}
                  />
                  <span>HÉRNIA INCISIONAL</span>
                </label>
              </div>
              
            </div>
          </div>
        </div>

        {/* Antecedents */}
        <div className="lg:col-span-1">
          <div className="filemaker-section">
            <h3 className="text-sm font-semibold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
              ANTECEDENTES
            </h3>
            <div className="space-y-2">
              {['paterno', 'materno', 'tios', 'avos'].map((tipo) => (
                <div key={tipo} className="border-b border-gray-200 pb-2">
                  <h4 className="text-xs font-medium text-filemaker-text mb-1 uppercase">
                    ANTECEDENTE {tipo === 'tios' ? 'TIOS' : tipo === 'avos' ? 'AVÓS' : tipo}
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 text-xs">
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.dm || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.dm || false)} 
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.dm`, e.target.checked)}
                      />
                      <span>DM</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.has || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.has || false)} 
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.has`, e.target.checked)}
                      />
                      <span>HAS</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.iam || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.iam || false)} 
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.iam`, e.target.checked)}
                      />
                      <span>IAM</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.avc || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.avc || false)} 
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.avc`, e.target.checked)}
                      />
                      <span>AVC</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.dislipidemia || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.dislipidemia || false)} 
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.dislipidemia`, e.target.checked)}
                      />
                      <span>DISLIPIDEMIA</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.neoplasias || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.neoplasias || false)} 
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.neoplasias`, e.target.checked)}
                      />
                      <span>NEOPLASIAS</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medications and Treatments */}
        <div className="lg:col-span-4">
          <div className="space-y-4">
            <div className="filemaker-section">
              <h3 className="text-sm font-semibold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
                MEDICAMENTOS PRÉ-OP
              </h3>
              <div className="space-y-2">
                {isEditing ? (
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">MEDICAMENTO</label>
                    <input
                      type="text"
                      value={(editedPaciente as any)?.dados_clinicos?.medicamento || ''}
                      onChange={(e) => handleInputChange('dados_clinicos.medicamento', e.target.value)}
                      className="filemaker-input w-full text-sm mb-2"
                      style={{ backgroundColor: '#fff' }}
                      placeholder="Nome do medicamento"
                    />
                    <label className="block text-xs font-medium text-filemaker-text mb-1">DOSAGEM</label>
                    <input
                      type="text"
                      value={(editedPaciente as any)?.dados_clinicos?.dosagem || ''}
                      onChange={(e) => handleInputChange('dados_clinicos.dosagem', e.target.value)}
                      className="filemaker-input w-full text-sm"
                      style={{ backgroundColor: '#fff' }}
                      placeholder="Dosagem"
                    />
                  </div>
                ) : (
                  <div>
                    {(paciente.dados_clinicos as any)?.medicamento && (
                      <div className="text-sm text-filemaker-text">
                        <strong>Medicamento:</strong> {(paciente.dados_clinicos as any).medicamento}
                      </div>
                    )}
                    {(paciente.dados_clinicos as any)?.dosagem && (
                      <div className="text-sm text-filemaker-text">
                        <strong>Dosagem:</strong> {(paciente.dados_clinicos as any).dosagem}
                      </div>
                    )}
                    {!(paciente.dados_clinicos as any)?.medicamento && !(paciente.dados_clinicos as any)?.dosagem && (
                      <div className="text-sm text-gray-500">Nenhum medicamento cadastrado</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="filemaker-section">
              <h3 className="text-sm font-semibold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
                TRATAMENTOS
              </h3>
              <div className="space-y-4">
                {/* Linha 1: Data Cirurgia e Local */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">DATA CIRURGIA</label>
                    <input
                      type="date"
                      value={isSearchMode ? (searchFields.data_cirurgia || '') : (() => {
                        const data = isEditing 
                          ? editedPaciente?.cirurgia?.data 
                          : paciente.cirurgia?.data;
                        if (!data) return '';
                        return new Date(data).toISOString().split('T')[0];
                      })()}
                      readOnly={!isEditing && !isSearchMode}
                      onChange={(e) => {
                        if (isSearchMode) {
                          onSearchFieldChange?.('data_cirurgia', e.target.value)
                        } else {
                          const isoDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                          handleInputChange('cirurgia.data', isoDate)
                        }
                      }}
                      className={`filemaker-input w-full text-sm sm:text-base ${
                        isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                      }`}
                      style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                      placeholder={isSearchMode ? "Buscar por data..." : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">LOCAL DA CIRURGIA</label>
                    <select
                      value={isSearchMode ? (searchFields.local_cirurgia || '') : (isEditing ? (editedPaciente?.cirurgia?.local || '') : (paciente.cirurgia?.local || ''))}
                      disabled={!isEditing && !isSearchMode}
                      onChange={(e) => {
                        if (isSearchMode) {
                          onSearchFieldChange?.('local_cirurgia', e.target.value)
                        } else {
                          handleInputChange('cirurgia.local', e.target.value)
                        }
                      }}
                      className={`filemaker-input w-full text-sm sm:text-base ${
                        isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                      }`}
                      style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                    >
                      <option value="">Selecione...</option>
                      <option value="SANTA CATARINA">SANTA CATARINA</option>
                      <option value="BLANCHO">BLANCHO</option>
                      <option value="CHAOC -P3">CHAOC -P3</option>
                      <option value="IGESP">IGESP</option>
                      <option value="METROPOLITANO">METROPOLITANO</option>
                      <option value="HCOR">HCOR</option>
                      <option value="SANTA RITA">SANTA RITA</option>
                      <option value="SÃO CAMILO">SÃO CAMILO</option>
                      <option value="HIAE">HIAE</option>
                      <option value="SÃO CAMILO-IPIRANGA">SÃO CAMILO-IPIRANGA</option>
                      <option value="BANDEIRANTES">BANDEIRANTES</option>
                      <option value="SANTA PAULA">SANTA PAULA</option>
                      <option value="SAMARITANO">SAMARITANO</option>
                      <option value="LEFORTE MORUMBI">LEFORTE MORUMBI</option>
                    </select>
                  </div>
                </div>

                {/* Linha 2: Tratamento e Tipo de Cirurgia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">TRATAMENTO</label>
                    <select
                      value={isSearchMode ? (searchFields.tratamento || '') : (isEditing ? (editedPaciente?.cirurgia?.tratamento || '') : (paciente.cirurgia?.tratamento || ''))}
                      disabled={!isEditing && !isSearchMode}
                      onChange={(e) => {
                        if (isSearchMode) {
                          onSearchFieldChange?.('tratamento', e.target.value)
                        } else {
                          handleInputChange('cirurgia.tratamento', e.target.value)
                        }
                      }}
                      className={`filemaker-input w-full text-sm sm:text-base ${
                        isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                      }`}
                      style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                    >
                      <option value="">Selecione...</option>
                      <option value="OBESIDADE">OBESIDADE</option>
                      <option value="DIABETES">DIABETES</option>
                      <option value="REFLUXO">REFLUXO</option>
                      <option value="HERNIA">HÉRNIA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">TIPO DE CIRURGIA</label>
                    <select
                      value={isSearchMode ? (searchFields.tipo_cirurgia || '') : (isEditing ? (editedPaciente?.cirurgia?.tipo || '') : (paciente.cirurgia?.tipo || ''))}
                      disabled={!isEditing && !isSearchMode}
                      onChange={(e) => {
                        if (isSearchMode) {
                          onSearchFieldChange?.('tipo_cirurgia', e.target.value)
                        } else {
                          handleInputChange('cirurgia.tipo', e.target.value)
                        }
                      }}
                      className={`filemaker-input w-full text-sm sm:text-base ${
                        isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                      }`}
                      style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                    >
                      <option value="">Selecione...</option>
                      <option value="BYPASS">BYPASS</option>
                      <option value="SLEEVE">SLEEVE</option>
                      <option value="BANDA">BANDA</option>
                      <option value="REVISIONAL">REVISIONAL</option>
                    </select>
                  </div>
                </div>

                {/* Linha 3: Segunda Cirurgia e Data Segunda Cirurgia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">SEGUNDA CIRURGIA</label>
                    <input
                      type="text"
                      value={isSearchMode ? (searchFields.segunda_cirurgia || '') : (isEditing ? (editedPaciente?.cirurgia?.segunda_cirurgia || '') : (paciente.cirurgia?.segunda_cirurgia || ''))}
                      readOnly={!isEditing && !isSearchMode}
                      onChange={(e) => {
                        if (isSearchMode) {
                          onSearchFieldChange?.('segunda_cirurgia', e.target.value)
                        } else {
                          handleInputChange('cirurgia.segunda_cirurgia', e.target.value)
                        }
                      }}
                      className={`filemaker-input w-full text-sm sm:text-base ${
                        isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                      }`}
                      style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                      placeholder={isSearchMode ? "Buscar por segunda cirurgia..." : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">DATA SEGUNDA CIRURGIA</label>
                    <input
                      type="date"
                      value={isSearchMode ? (searchFields.data_segunda_cirurgia || '') : (() => {
                        const data = isEditing 
                          ? editedPaciente?.cirurgia?.data_segunda_cirurgia 
                          : paciente.cirurgia?.data_segunda_cirurgia;
                        if (!data) return '';
                        return new Date(data).toISOString().split('T')[0];
                      })()}
                      readOnly={!isEditing && !isSearchMode}
                      onChange={(e) => {
                        if (isSearchMode) {
                          onSearchFieldChange?.('data_segunda_cirurgia', e.target.value)
                        } else {
                          const isoDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                          handleInputChange('cirurgia.data_segunda_cirurgia', isoDate)
                        }
                      }}
                      className={`filemaker-input w-full text-sm sm:text-base ${
                        isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                      }`}
                      style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                    />
                  </div>
                </div>

                {/* Linha 4: Petersen Fechado e Tamanho das Alças */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">PETERSEN FECHADO</label>
                    <select
                      value={isSearchMode ? (searchFields.petersen_fechado || '') : (isEditing ? (editedPaciente?.cirurgia?.petersenFechado ? 'SIM' : 'NÃO') : (paciente.cirurgia?.petersenFechado ? 'SIM' : 'NÃO'))}
                      disabled={!isEditing && !isSearchMode}
                      onChange={(e) => {
                        if (isSearchMode) {
                          onSearchFieldChange?.('petersen_fechado', e.target.value)
                        } else {
                          handleInputChange('cirurgia.petersenFechado', e.target.value === 'SIM')
                        }
                      }}
                      className={`filemaker-input w-full text-sm sm:text-base ${
                        isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                      }`}
                      style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                    >
                      <option value="">Selecione...</option>
                      <option value="SIM">SIM</option>
                      <option value="NÃO">NÃO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-filemaker-text mb-1">TAMANHO DAS ALÇAS</label>
                    <select
                      value={isSearchMode ? (searchFields.tamanho_alcas || '') : (isEditing ? (editedPaciente?.cirurgia?.tamanho_alcas || '') : (paciente.cirurgia?.tamanho_alcas || ''))}
                      disabled={!isEditing && !isSearchMode}
                      onChange={(e) => {
                        if (isSearchMode) {
                          onSearchFieldChange?.('tamanho_alcas', e.target.value)
                        } else {
                          handleInputChange('cirurgia.tamanho_alcas', e.target.value)
                        }
                      }}
                      className={`filemaker-input w-full text-sm sm:text-base ${
                        isSearchMode ? 'bg-orange-50 border-orange-300 focus:border-orange-500' : ''
                      }`}
                      style={{ backgroundColor: isSearchMode ? '#fef3e2' : isEditing ? '#fff' : '#f9f9f9' }}
                    >
                      <option value="">Selecione...</option>
                      <option value="50/150">50/150</option>
                      <option value="75/150">75/150</option>
                      <option value="100/150">100/150</option>
                      <option value="150/150">150/150</option>
                      <option value="OUTRO">OUTRO</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Modal para visualizar PDF */}
      {showPdfModal && (isEditing ? editedPaciente?.hma_resumo_pdf : paciente.hma_resumo_pdf) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPdfModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Resumo HMA - PDF</h3>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`http://localhost:3004/uploads/hma/pdf/${isEditing ? editedPaciente?.hma_resumo_pdf : paciente.hma_resumo_pdf}`}
                className="w-full h-full"
                title="PDF Resumo HMA"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
