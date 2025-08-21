'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Paciente } from '../types/paciente'
import { BotaoDeletarPaciente } from './BotaoDeletarPaciente'
import { useToast } from './Toast'

interface PacienteCardProps {
  paciente: Paciente
}

export default function PacienteCard({ paciente }: PacienteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedPaciente, setEditedPaciente] = useState<Paciente | null>(null)
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
      const response = await fetch(`http://localhost:3001/pacientes/${paciente._id}`, {
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

  const handleInputChange = (field: string, value: any) => {
    if (!editedPaciente) return
    
    const fieldParts = field.split('.')
    if (fieldParts.length === 1) {
      setEditedPaciente({ ...editedPaciente, [field]: value })
    } else {
      const [parentField, childField] = fieldParts
      const parentObject = editedPaciente[parentField as keyof Paciente] || {}
      setEditedPaciente({
        ...editedPaciente,
        [parentField]: {
          ...(typeof parentObject === 'object' ? parentObject : {}),
          [childField]: value
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
          {!isEditing ? (
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
        
        <div className="w-full sm:w-auto flex justify-end">
          <BotaoDeletarPaciente paciente={paciente} />
        </div>
      </div>

      {/* Header with patient basic info - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block text-xs font-medium text-filemaker-text mb-1">NOME</label>
          <input
            type="text"
            value={currentData?.nome || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className={`filemaker-input w-full text-sm sm:text-base ${!currentData?.nome && isEditing ? 'border-red-500' : ''}`}
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
          {isEditing && !currentData?.nome && (
            <div className="text-red-500 text-xs mt-1">Campo obrigatório</div>
          )}
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">DATA NASCIMENTO</label>
          <input
            type="date"
            value={currentData?.dataNascimento || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">IDADE</label>
          <input
            type="number"
            value={currentData?.idade || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('idade', e.target.value ? parseInt(e.target.value) || 0 : '')}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">SEXO</label>
          <select
            value={currentData?.sexo || ''}
            disabled={!isEditing}
            onChange={(e) => handleInputChange('sexo', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          >
            <option value="">Selecione</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="O">Outro</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">DATA 1ª CONSULTA</label>
          <input
            type="text"
            value={paciente?.dataPrimeiraConsulta ? formatDate(paciente.dataPrimeiraConsulta) : ''}
            readOnly
            className="filemaker-input w-full text-sm sm:text-base"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">INDICAÇÃO</label>
          <input
            type="text"
            value={currentData?.indicacao || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('indicacao', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
      </div>

      {/* Address and Contact - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block text-xs font-medium text-filemaker-text mb-1">LOGRADOURO</label>
          <input
            type="text"
            value={currentData?.endereco?.normalizado?.logradouro || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('endereco.normalizado.logradouro', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">NÚMERO</label>
          <input
            type="text"
            value={currentData?.endereco?.normalizado?.numero || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('endereco.normalizado.numero', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">COMPLEMENTO</label>
          <input
            type="text"
            value={''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('endereco.normalizado.complemento', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CEP</label>
          <input
            type="text"
            value={currentData?.endereco?.cep || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('endereco.cep', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">BAIRRO</label>
          <input
            type="text"
            value={(() => {
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
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('endereco.normalizado.bairro', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CIDADE</label>
          <input
            type="text"
            value={currentData?.endereco?.normalizado?.cidade || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('endereco.normalizado.cidade', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">ESTADO</label>
          <input
            type="text"
            value={currentData?.endereco?.normalizado?.estado || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('endereco.normalizado.estado', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
      </div>

      {/* Contact, Insurance and Documents - Uma única linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">TELEFONE</label>
          <input
            type="tel"
            value={currentData?.contato?.telefone || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('contato.telefone', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CELULAR</label>
          <input
            type="tel"
            value={currentData?.contato?.celular || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('contato.celular', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">EMAIL</label>
          <input
            type="email"
            value={currentData?.contato?.email || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('contato.email', e.target.value)}
            className="filemaker-input w-full text-sm sm:text-base"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CONVÊNIO</label>
          <input
            type="text"
            value={paciente.convenio?.nome || ''}
            readOnly
            className="filemaker-input w-full text-sm sm:text-base"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CARTEIRINHA</label>
          <input
            type="text"
            value={paciente.convenio?.carteirinha || ''}
            readOnly
            className="filemaker-input w-full text-sm sm:text-base"
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">PLANO</label>
          <input
            type="text"
            value={paciente.convenio?.plano || ''}
            readOnly
            className="filemaker-input w-full text-sm sm:text-base"
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">RG</label>
          <input
            type="text"
            value={paciente.documentos?.rg || ''}
            readOnly
            className="filemaker-input w-full text-sm sm:text-base"
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CPF</label>
          <input
            type="text"
            value={paciente.documentos?.cpf || ''}
            readOnly
            className="filemaker-input w-full text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Clinical Data and Antecedents - Responsivo */}
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
                    value={paciente.dados_clinicos?.peso || ''}
                    readOnly
                    className="filemaker-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-filemaker-text mb-1">ALTURA</label>
                  <input
                    type="text"
                    value={paciente.dados_clinicos?.altura || ''}
                    readOnly
                    className="filemaker-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-filemaker-text mb-1">IMC</label>
                  <input
                    type="text"
                    value={paciente.dados_clinicos?.imc || ''}
                    readOnly
                    className="filemaker-input w-full text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.has || false} readOnly />
                  <span>HAS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.diabetes || false} readOnly />
                  <span>DIABETES</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.dislipidemia || false} readOnly />
                  <span>DISLIPIDEMIA</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.apneia || false} readOnly />
                  <span>APNÉIA</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.artropatias || false} readOnly />
                  <span>ARTROPATIAS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.ccc || false} readOnly />
                  <span>CCC</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.esteatose || false} readOnly />
                  <span>ESTEATOSE</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.hernia_hiato || false} readOnly />
                  <span>HÉRNIA DE HIATO</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.refluxo || false} readOnly />
                  <span>REFLUXO</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.hernia_incisional || false} readOnly />
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
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.dm || false} 
                        readOnly 
                      />
                      <span>DM</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.has || false} 
                        readOnly 
                      />
                      <span>HAS</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.iam || false} 
                        readOnly 
                      />
                      <span>IAM</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.avc || false} 
                        readOnly 
                      />
                      <span>AVC</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.dislipidemia || false} 
                        readOnly 
                      />
                      <span>DISLIPIDEMIA</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.neoplasias || false} 
                        readOnly 
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
                {paciente.dados_clinicos?.medicacoes_preop?.map((med, index) => (
                  <div key={`med-${index}-${med}`} className="text-sm text-filemaker-text">
                    {med}
                  </div>
                )) || <div className="text-sm text-gray-500">Nenhum medicamento cadastrado</div>}
              </div>
            </div>

            <div className="filemaker-section">
              <h3 className="text-sm font-semibold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
                TRATAMENTOS
              </h3>
              <div className="space-y-2">
                {paciente.cirurgia?.previa && (
                  <div className="text-sm">
                    <div><strong>Cirurgia Prévia:</strong> {paciente.cirurgia.tipo}</div>
                    <div><strong>Data:</strong> {formatDate(paciente.cirurgia.data)}</div>
                    <div><strong>Local:</strong> {paciente.cirurgia.local}</div>
                    <div><strong>Tratamento:</strong> {paciente.cirurgia.tratamento}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
