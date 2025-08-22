'use client'

import { useState } from 'react'
import { Paciente } from '../types/paciente'
import { createPacienteSchema } from '@/schemas/paciente'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useToast } from './Toast'
import { fetchAddressByCep, formatCep } from '@/utils/viaCep'

interface CreatePacienteFormProps {
  onClose: () => void
  onSuccess: (newPaciente: Paciente) => void
}

export default function CreatePacienteForm({ onClose, onSuccess }: CreatePacienteFormProps) {
  const [isCreating, setIsCreating] = useState(false)
  const toast = useToast()
  const { validate, errors, getFieldError, hasErrors } = useFormValidation(createPacienteSchema)
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    idade: '',
    sexo: '',
    indicacao: '',
    dataPrimeiraConsulta: '',
    endereco: { 
      completo: '', 
      cep: '', 
      normalizado: { 
        logradouro: '', 
        numero: '', 
        complemento: '', 
        bairro: '', 
        cidade: '', 
        estado: '' 
      } 
    },
    contato: { telefone: '', email: '', celular: '' },
    convenio: { nome: '', carteirinha: '', plano: '' },
    documentos: { rg: '', cpf: '' }
  })

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

  const handleInputChange = (field: string, value: string) => {
    // Aplicar trim e maiúsculo apenas no campo nome
    const processedValue = field === 'nome' ? value.trim().toUpperCase() : value
    
    const fieldParts = field.split('.')
    
    if (fieldParts.length === 1) {
      const newFormData = {
        ...formData,
        [field]: processedValue
      }
      
      // Se mudou a data de nascimento, calcular idade automaticamente
      if (field === 'dataNascimento' && processedValue) {
        newFormData.idade = calculateAge(processedValue).toString()
      }
      
      setFormData(newFormData)
    } else if (fieldParts.length === 2) {
      const [parentField, childField] = fieldParts
      const parentObject = formData[parentField as keyof typeof formData] || {}
      setFormData({
        ...formData,
        [parentField]: {
          ...(typeof parentObject === 'object' ? parentObject : {}),
          [childField]: processedValue
        }
      })
    } else if (fieldParts.length === 3) {
      const [parentField, middleField, childField] = fieldParts
      const parentObject = formData[parentField as keyof typeof formData] as any || {}
      const middleObject = parentObject[middleField] || {}
      setFormData({
        ...formData,
        [parentField]: {
          ...parentObject,
          [middleField]: {
            ...middleObject,
            [childField]: processedValue
          }
        }
      })
    }
  }

  const handleCreate = async () => {
    // Converte dados do formulário para o formato correto
    const dataToValidate = {
      ...formData,
      idade: formData.idade ? parseInt(formData.idade) || undefined : undefined
    }

    // Valida os dados
    const validation = await validate(dataToValidate)
    if (!validation.isValid) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }
    
    setIsCreating(true)
    try {
      const response = await fetch('http://localhost:3004/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToValidate)
      })

      if (response.ok) {
        const newPaciente = await response.json()
        
        toast.success('Paciente criado com sucesso!')
        
        onSuccess(newPaciente)
        onClose()
      } else {
        throw new Error('Erro ao criar paciente')
      }
    } catch (error) {
      console.error('Erro ao criar:', error)
      toast.error('Erro ao criar paciente')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-filemaker-header">Novo Paciente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <label className="block text-xs font-medium text-filemaker-text mb-1">NOME *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={`filemaker-input w-full font-medium ${getFieldError('nome') ? 'border-red-500' : ''}`}
                placeholder="Nome completo"
                required
              />
              {getFieldError('nome') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('nome')}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">INDICAÇÃO</label>
              <input
                type="text"
                value={formData.indicacao}
                onChange={(e) => {
                  const value = e.target.value
                  const capitalizedValue = value.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')
                  handleInputChange('indicacao', capitalizedValue)
                }}
                className="filemaker-input w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">DATA 1ª CONSULTA</label>
              <input
                type="date"
                value={formData.dataPrimeiraConsulta}
                onChange={(e) => handleInputChange('dataPrimeiraConsulta', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">Data Nascimento</label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-filemaker-text mb-1">IDADE</label>
              <input
                type="number"
                value={formData.idade}
                readOnly
                className="filemaker-input w-full bg-gray-100"
                placeholder="Calculada automaticamente"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-filemaker-text mb-1">SEXO</label>
              <select
                value={formData.sexo}
                onChange={(e) => handleInputChange('sexo', e.target.value)}
                className="filemaker-input w-full"
              >
                <option value="">Selecione</option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>

          {/* Endereço - Uma única linha */}
          <div className="flex gap-4 w-full">
            <div className="w-32 min-w-32 max-w-32">
              <label className="block text-xs font-medium text-filemaker-text mb-1">CEP</label>
              <input
                type="text"
                value={formData.endereco.cep}
                onChange={async (e) => {
                  const value = e.target.value
                  const formattedCep = formatCep(value)
                  handleInputChange('endereco.cep', formattedCep)
                  
                  // Se CEP está completo (8 dígitos), busca endereço
                  if (formattedCep.replace(/\D/g, '').length === 8) {
                    try {
                      // Usar a API do ViaCEP através do proxy local
                      const response = await fetch(`/api/viacep/${formattedCep.replace(/\D/g, '')}/json/`)
                      if (response.ok) {
                        const addressData = await response.json()
                        if (addressData && !addressData.erro) {
                          setFormData(prev => ({
                            ...prev,
                            endereco: {
                              ...prev.endereco,
                              normalizado: {
                                ...prev.endereco?.normalizado,
                                logradouro: addressData.logradouro || '',
                                bairro: addressData.bairro || '',
                                cidade: addressData.localidade || '',
                                estado: addressData.uf || ''
                              }
                            }
                          }))
                        }
                      }
                    } catch (error) {
                      console.error('Erro ao buscar CEP:', error)
                    }
                  }
                }}
                className="filemaker-input w-full"
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
            <div className="flex-[4]">
              <label className="block text-xs font-medium text-filemaker-text mb-1">LOGRADOURO</label>
              <input
                type="text"
                value={formData.endereco.normalizado.logradouro}
                onChange={(e) => handleInputChange('endereco.normalizado.logradouro', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="w-16 min-w-16 max-w-16">
              <label className="block text-xs font-medium text-filemaker-text mb-1">NÚMERO</label>
              <input
                type="text"
                value={formData.endereco.normalizado.numero}
                onChange={(e) => handleInputChange('endereco.normalizado.numero', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="w-24 min-w-24 max-w-24">
              <label className="block text-xs font-medium text-filemaker-text mb-1">COMPLEMENTO</label>
              <input
                type="text"
                value={formData.endereco.normalizado.complemento}
                onChange={(e) => handleInputChange('endereco.normalizado.complemento', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="w-32 min-w-32 max-w-32">
              <label className="block text-xs font-medium text-filemaker-text mb-1">BAIRRO</label>
              <input
                type="text"
                value={formData.endereco.normalizado.bairro}
                onChange={(e) => handleInputChange('endereco.normalizado.bairro', e.target.value)}
                className="filemaker-input w-full"
                placeholder="Bairro"
              />
            </div>
            <div className="w-80 min-w-80 max-w-80">
              <label className="block text-xs font-medium text-filemaker-text mb-1">CIDADE</label>
              <input
                type="text"
                value={formData.endereco.normalizado.cidade}
                onChange={(e) => handleInputChange('endereco.normalizado.cidade', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="w-16 min-w-16 max-w-16">
              <label className="block text-xs font-medium text-filemaker-text mb-1">ESTADO</label>
              <input
                type="text"
                value={formData.endereco.normalizado.estado}
                onChange={(e) => handleInputChange('endereco.normalizado.estado', e.target.value)}
                className="filemaker-input w-full"
                maxLength={4}
                placeholder="SP"
              />
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">CELULAR</label>
              <input
                type="tel"
                value={formData.contato.celular}
                onChange={(e) => handleInputChange('contato.celular', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">TELEFONE</label>
              <input
                type="tel"
                value={formData.contato.telefone}
                onChange={(e) => handleInputChange('contato.telefone', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">EMAIL</label>
              <input
                type="email"
                value={formData.contato.email}
                onChange={(e) => handleInputChange('contato.email', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
          </div>

          {/* Convênio e Documentos */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className="block text-xs font-medium text-filemaker-text mb-1">CONVÊNIO</label>
              <input
                type="text"
                value={formData.convenio.nome}
                onChange={(e) => handleInputChange('convenio.nome', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-filemaker-text mb-1">CARTEIRINHA</label>
              <input
                type="text"
                value={formData.convenio.carteirinha}
                onChange={(e) => handleInputChange('convenio.carteirinha', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">RG</label>
              <input
                type="text"
                value={formData.documentos.rg}
                onChange={(e) => handleInputChange('documentos.rg', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">CPF</label>
              <input
                type="text"
                value={formData.documentos.cpf}
                onChange={(e) => handleInputChange('documentos.cpf', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isCreating ? '⏳ Criando...' : '✅ Criar Paciente'}
          </button>
        </div>
      </div>
    </div>
  )
}
