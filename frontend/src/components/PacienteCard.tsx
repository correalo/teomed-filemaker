'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Paciente } from '../types/paciente'
import { BotaoDeletarPaciente } from './BotaoDeletarPaciente'

interface PacienteCardProps {
  paciente: Paciente
}

export default function PacienteCard({ paciente }: PacienteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedPaciente, setEditedPaciente] = useState<Paciente | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
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
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      toast.textContent = `⚠️ Campos obrigatórios: ${missingFields.join(', ')}`
      document.body.appendChild(toast)
      setTimeout(() => document.body.removeChild(toast), 4000)
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
        
        // Toast de sucesso
        const toast = document.createElement('div')
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
        toast.textContent = '✅ Dados salvos com sucesso!'
        document.body.appendChild(toast)
        setTimeout(() => document.body.removeChild(toast), 3000)
      } else {
        throw new Error('Erro na resposta do servidor')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      
      // Toast de erro
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      toast.textContent = '❌ Erro ao salvar dados do paciente'
      document.body.appendChild(toast)
      setTimeout(() => document.body.removeChild(toast), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    console.log('handleDelete chamado')
    
    // Aguardar 3 segundos antes de executar para dar tempo de ler
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    try {
      console.log('Fazendo request DELETE para:', `http://localhost:3001/pacientes/${paciente._id}`)
      const response = await fetch(`http://localhost:3001/pacientes/${paciente._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      console.log('Response status:', response.status)
      if (response.ok) {
        console.log('Delete bem-sucedido, criando toast')
        
        // Toast de sucesso simples primeiro
        alert('✅ Paciente deletado com sucesso! Clique OK para recarregar.')
        window.location.reload()
      } else {
        console.log('Erro na response:', response.status)
        throw new Error('Erro ao deletar')
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('❌ Erro ao deletar paciente')
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
    <div className="filemaker-card p-6">
      {/* Action Buttons */}
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-filemaker-blue text-white rounded hover:bg-blue-600 transition-colors"
            >
              ✏️ Editar
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                ❌ Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? '⏳ Salvando...' : '✅ Salvar'}
              </button>
            </>
          )}
        </div>
        
        <div className="flex space-x-2">
          <BotaoDeletarPaciente paciente={paciente} />
        </div>
      </div>

      {/* Header with patient basic info */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-4">
          <label className="block text-xs font-medium text-filemaker-text mb-1">NOME</label>
          <input
            type="text"
            value={currentData?.nome || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className="filemaker-input w-full font-medium text-filemaker-header"
            placeholder="Nome do paciente"
            required
            style={{ 
              color: '#000', 
              backgroundColor: isEditing ? '#fff' : '#f9f9f9',
              borderColor: isEditing && !currentData?.nome ? '#ef4444' : undefined
            }}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">Birthday</label>
          <input
            type="date"
            value={currentData?.dataNascimento || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
            className="filemaker-input w-full"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">IDADE</label>
          <input
            type="number"
            value={currentData?.idade || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('idade', parseInt(e.target.value))}
            className="filemaker-input w-full"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">SEXO</label>
          {isEditing ? (
            <select
              value={currentData?.sexo || ''}
              onChange={(e) => handleInputChange('sexo', e.target.value)}
              className="filemaker-input w-full"
            >
              <option value="">Selecione</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          ) : (
            <input
              type="text"
              value={currentData?.sexo || ''}
              readOnly
              className="filemaker-input w-full"
              style={{ backgroundColor: '#f9f9f9' }}
            />
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">DATA 1ª CONSULTA</label>
          <input
            type="text"
            value={paciente?.dataPrimeiraConsulta ? formatDate(paciente.dataPrimeiraConsulta) : ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">PRONTUÁRIO</label>
          <input
            type="number"
            value={currentData?.prontuario || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('prontuario', parseInt(e.target.value))}
            className="filemaker-input w-full font-medium"
            required
            style={{ 
              backgroundColor: isEditing ? '#fff' : '#f9f9f9',
              borderColor: isEditing && !currentData?.prontuario ? '#ef4444' : undefined
            }}
          />
        </div>
      </div>

      {/* Address and Contact */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">INDICAÇÃO</label>
          <input
            type="text"
            value={currentData?.indicacao || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('indicacao', e.target.value)}
            className="filemaker-input w-full"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="col-span-6">
          <label className="block text-xs font-medium text-filemaker-text mb-1">ENDEREÇO</label>
          <input
            type="text"
            value={currentData?.endereco?.completo || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('endereco.completo', e.target.value)}
            className="filemaker-input w-full"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CELULAR</label>
          <input
            type="tel"
            value={currentData?.contato?.celular || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('contato.celular', e.target.value)}
            className="filemaker-input w-full"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">Email</label>
          <input
            type="email"
            value={currentData?.contato?.email || ''}
            readOnly={!isEditing}
            onChange={(e) => handleInputChange('contato.email', e.target.value)}
            className="filemaker-input w-full"
            style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
          />
        </div>
      </div>

      {/* Insurance and Documents */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CONVÊNIO</label>
          <input
            type="text"
            value={paciente.convenio?.nome || ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CARTEIRINHA</label>
          <input
            type="text"
            value={paciente.convenio?.carteirinha || ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-xs font-medium text-filemaker-text mb-1">PLANO</label>
          <input
            type="text"
            value={paciente.convenio?.plano || ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">RG</label>
          <input
            type="text"
            value={paciente.documentos?.rg || ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CPF</label>
          <input
            type="text"
            value={paciente.documentos?.cpf || ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
      </div>

      {/* Clinical Data and Antecedents */}
      <div className="grid grid-cols-12 gap-6">
        {/* Clinical Evaluation */}
        <div className="col-span-4">
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
                  <input type="checkbox" checked={paciente.dados_clinicos?.has} readOnly />
                  <span>HAS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.diabetes} readOnly />
                  <span>DIABETES</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.dislipidemia} readOnly />
                  <span>DISLIPIDEMIA</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.apneia} readOnly />
                  <span>APNÉIA</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.artropatias} readOnly />
                  <span>ARTROPATIAS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.ccc} readOnly />
                  <span>CCC</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.esteatose} readOnly />
                  <span>ESTEATOSE</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.hernia_hiato} readOnly />
                  <span>HÉRNIA DE HIATO</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.refluxo} readOnly />
                  <span>REFLUXO</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={paciente.dados_clinicos?.hernia_incisional} readOnly />
                  <span>HÉRNIA INCISIONAL</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Antecedents */}
        <div className="col-span-4">
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
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.dm} 
                        readOnly 
                      />
                      <span>DM</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.has} 
                        readOnly 
                      />
                      <span>HAS</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.iam} 
                        readOnly 
                      />
                      <span>IAM</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.avc} 
                        readOnly 
                      />
                      <span>AVC</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.dislipidemia} 
                        readOnly 
                      />
                      <span>DISLIPIDEMIA</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={paciente.antecedentes?.[tipo as keyof typeof paciente.antecedentes]?.neoplasias} 
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
        <div className="col-span-4">
          <div className="space-y-4">
            <div className="filemaker-section">
              <h3 className="text-sm font-semibold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
                MEDICAMENTOS PRÉ-OP
              </h3>
              <div className="space-y-2">
                {paciente.dados_clinicos?.medicacoes_preop?.map((med, index) => (
                  <div key={index} className="text-sm text-filemaker-text">
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
