'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Paciente } from '../types/paciente'
import { formatPeso, formatAltura, displayPeso, displayAltura, validatePeso, validateAltura, calculateIMC } from '@/utils/formatters'
import { fetchAddressByCep, formatCep, formatPhone, formatCellPhone, formatRG, formatCPF, formatEmail, validateEmail, validateAndFormatCPF } from '../utils/viaCep'
import ConvenioSelect from './ConvenioSelect'
import PlanoSelect from './PlanoSelect'
import ProfissaoSelect from './ProfissaoSelect'
import StatusSelect from './StatusSelect'
import TratamentosCard from './TratamentosCard'
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

export default function PacienteCard({ paciente, isSearchMode = false, searchFields = {}, onSearchFieldChange }: PacienteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedPaciente, setEditedPaciente] = useState<Partial<Paciente> | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const toast = useToast()
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const handleEdit = () => {
    setEditedPaciente({ ...paciente })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedPaciente(null)
    setIsEditing(false)
  }

  const validateRequired = () => {
    if (!editedPaciente) return false
    
    const requiredFields = ['nome', 'prontuario']
    const missingFields = []
    
    for (const field of requiredFields) {
      if (!editedPaciente[field as keyof Paciente]) {
        missingFields.push(field)
      }
    }
    
    if (missingFields.length > 0) {
      toast.warning(`Campos obrigatórios: ${missingFields.join(', ')}`, 4000)
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!editedPaciente || !validateRequired()) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`http://localhost:3004/pacientes/${paciente._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedPaciente)
      })

      if (response.ok) {
        // Atualizar dados locais
        Object.assign(paciente, editedPaciente)
        setIsEditing(false)
        setEditedPaciente(null)
        
        toast.success('Dados salvos com sucesso!')
      } else {
        throw new Error('Erro na resposta do servidor')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar dados do paciente')
    } finally {
      setIsSaving(false)
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
    const processedValue = field === 'nome' ? value.trim().toUpperCase() : value
    
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
      setEditedPaciente({
        ...editedPaciente,
        [parentField]: {
          ...(typeof parentObject === 'object' ? parentObject : {}),
          [childField]: processedValue
        }
      })
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
              apiEndpoint="http://localhost:3004/pacientes/autocomplete/nomes"
            />
          ) : (
            <input
              type="text"
              value={currentData?.nome || ''}
              readOnly={!isEditing}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={`filemaker-input w-full text-sm sm:text-base ${
                !currentData?.nome && isEditing ? 'border-red-500' : ''
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Clinical Evaluation */}
          <div className="lg:col-span-4">
            <div className="filemaker-section">
              <h3 className="text-sm font-semibold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
                AVALIAÇÃO CLÍNICA
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-filemaker-text mb-1">PESO</label>
                    <input
                      type="text"
                      value={isEditing ? (editedPaciente?.dados_clinicos?.peso || '') : displayPeso(String(paciente.dados_clinicos?.peso || ''))}
                      readOnly={!isEditing}
                      onChange={(e) => {
                        const formatted = formatPeso(e.target.value)
                        const validation = validatePeso(formatted)
                        
                        if (!validation.isValid && formatted) {
                          setValidationErrors(prev => ({ ...prev, peso: validation.message || '' }))
                        } else {
                          setValidationErrors(prev => ({ ...prev, peso: '' }))
                        }
                        
                        handleInputChange('dados_clinicos.peso', formatted)
                        
                        // Calcular IMC automaticamente
                        const altura = editedPaciente?.dados_clinicos?.altura || ''
                        if (altura) {
                          const imc = calculateIMC(formatted, String(altura))
                          handleInputChange('dados_clinicos.imc', imc)
                        }
                      }}
                      className="filemaker-input w-full text-sm"
                      style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
                      placeholder={isEditing ? "000.0" : ""}
                    />
                    {validationErrors.peso && (
                      <div className="text-red-500 text-xs mt-1">{validationErrors.peso}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-filemaker-text mb-1">ALTURA</label>
                    <input
                      type="text"
                      value={isEditing ? (editedPaciente?.dados_clinicos?.altura || '') : displayAltura(String(paciente.dados_clinicos?.altura || ''))}
                      readOnly={!isEditing}
                      onChange={(e) => {
                        const formatted = formatAltura(e.target.value)
                        const validation = validateAltura(formatted)
                        
                        if (!validation.isValid && formatted) {
                          setValidationErrors(prev => ({ ...prev, altura: validation.message || '' }))
                        } else {
                          setValidationErrors(prev => ({ ...prev, altura: '' }))
                        }
                        
                        handleInputChange('dados_clinicos.altura', formatted)
                        
                        // Calcular IMC automaticamente
                        const peso = editedPaciente?.dados_clinicos?.peso || ''
                        if (peso) {
                          const imc = calculateIMC(String(peso), formatted)
                          handleInputChange('dados_clinicos.imc', imc)
                        }
                      }}
                      className="filemaker-input w-full text-sm"
                      style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
                      placeholder={isEditing ? "0.00" : ""}
                    />
                    {validationErrors.altura && (
                      <div className="text-red-500 text-xs mt-1">{validationErrors.altura}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-filemaker-text mb-1">IMC</label>
                    <input
                      type="text"
                      value={isEditing ? (editedPaciente?.dados_clinicos?.imc || '') : (paciente.dados_clinicos?.imc || '')}
                      readOnly={true}
                      className="filemaker-input w-full text-sm"
                      style={{ backgroundColor: '#f0f0f0', color: '#666' }}
                      placeholder="Calculado automaticamente"
                    />
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.has || false) : (paciente.dados_clinicos?.has || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.has', e.target.checked)}
                  />
                  <span>HAS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.diabetes || false) : (paciente.dados_clinicos?.diabetes || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.diabetes', e.target.checked)}
                  />
                  <span>DIABETES</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.dislipidemia || false) : (paciente.dados_clinicos?.dislipidemia || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.dislipidemia', e.target.checked)}
                  />
                  <span>DISLIPIDEMIA</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.apneia || false) : (paciente.dados_clinicos?.apneia || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.apneia', e.target.checked)}
                  />
                  <span>APNÉIA</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.artropatias || false) : (paciente.dados_clinicos?.artropatias || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.artropatias', e.target.checked)}
                  />
                  <span>ARTROPATIAS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.ccc || false) : (paciente.dados_clinicos?.ccc || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.ccc', e.target.checked)}
                  />
                  <span>CCC</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.esteatose || false) : (paciente.dados_clinicos?.esteatose || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.esteatose', e.target.checked)}
                  />
                  <span>ESTEATOSE</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.hernia_hiato || false) : (paciente.dados_clinicos?.hernia_hiato || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.hernia_hiato', e.target.checked)}
                  />
                  <span>HÉRNIA DE HIATO</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.refluxo || false) : (paciente.dados_clinicos?.refluxo || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.refluxo', e.target.checked)}
                  />
                  <span>REFLUXO</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isEditing ? (editedPaciente?.dados_clinicos?.hernia_incisional || false) : (paciente.dados_clinicos?.hernia_incisional || false)} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('dados_clinicos.hernia_incisional', e.target.checked)}
                  />
                  <span>HÉRNIA INCISIONAL</span>
                </label>
              </div>
              
            </div>
          </div>
        </div>

        {/* Antecedents */}
        <div className="lg:col-span-4">
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
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.dm || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.dm || false)} 
                        readOnly={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.dm`, e.target.checked)}
                      />
                      <span>DM</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.has || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.has || false)} 
                        readOnly={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.has`, e.target.checked)}
                      />
                      <span>HAS</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.iam || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.iam || false)} 
                        readOnly={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.iam`, e.target.checked)}
                      />
                      <span>IAM</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.avc || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.avc || false)} 
                        readOnly={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.avc`, e.target.checked)}
                      />
                      <span>AVC</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.dislipidemia || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.dislipidemia || false)} 
                        readOnly={!isEditing}
                        onChange={(e) => handleInputChange(`antecedentes.${tipo}.dislipidemia`, e.target.checked)}
                      />
                      <span>DISLIPIDEMIA</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={isEditing ? (editedPaciente?.antecedentes?.[tipo as keyof typeof editedPaciente.antecedentes]?.neoplasias || false) : (paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.neoplasias || false)} 
                        readOnly={!isEditing}
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
              <div className="space-y-2">
                {isEditing ? (
                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={Boolean(editedPaciente?.dados_clinicos?.cirurgia_previa)}
                        onChange={(e) => handleInputChange('dados_clinicos.cirurgia_previa', e.target.checked)}
                      />
                      <span className="text-xs font-medium text-filemaker-text">CIRURGIA PRÉVIA</span>
                    </label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">DETALHAMENTO</label>
                        <input
                          type="text"
                          value={editedPaciente?.dados_clinicos?.cir_previa || ''}
                          onChange={(e) => handleInputChange('dados_clinicos.cir_previa', e.target.value)}
                          className="filemaker-input w-full text-sm"
                          style={{ backgroundColor: '#fff' }}
                          placeholder="Detalhes da cirurgia prévia..."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    {paciente.dados_clinicos?.cirurgia_previa && (
                      <div>
                        <div><strong>Cirurgia Prévia:</strong> Sim</div>
                        {paciente.dados_clinicos?.cir_previa && (
                          <div><strong>Detalhamento:</strong> {paciente.dados_clinicos.cir_previa}</div>
                        )}
                      </div>
                    )}
                    {!paciente.dados_clinicos?.cirurgia_previa && (
                      <div className="text-gray-500">Nenhuma cirurgia prévia</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Card de Tratamentos */}
      {!isSearchMode && (
        <TratamentosCard
          paciente={paciente}
          isEditing={isEditing}
          isSearchMode={isSearchMode}
          searchFields={searchFields}
          onSearchFieldChange={onSearchFieldChange}
          onUpdate={(updatedData) => setEditedPaciente(updatedData as Paciente)}
        />
      )}

      {/* Card de Tratamentos - Modo Busca */}
      {isSearchMode && (
        <TratamentosCard
          paciente={paciente}
          isEditing={false}
          isSearchMode={isSearchMode}
          searchFields={searchFields}
          onSearchFieldChange={onSearchFieldChange}
          onUpdate={() => {}}
        />
      )}
    </div>
  )
}
