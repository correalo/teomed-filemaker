'use client'

import { useState } from 'react'
import { Paciente } from '../types/paciente'
import { createPacienteSchema } from '@/schemas/paciente'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useToast } from './Toast'
import { fetchAddressByCep, formatCep, formatPhone, formatCellPhone, formatRG, formatCPF, formatEmail, validateEmail, validateAndFormatCPF } from '../utils/viaCep'
import ConvenioSelect from './ConvenioSelect'
import PlanoSelect from './PlanoSelect'
import ProfissaoSelect from './ProfissaoSelect'
import StatusSelect from './StatusSelect'
import EmailInput from './EmailInput'
import WhatsAppButton from './WhatsAppButton'
import EmailButton from './EmailButton'
import CPFInput from './CPFInput'

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
    profissao: '',
    status: '',
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
      const response = await fetch('http://localhost:3005/pacientes', {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-filemaker-header">Novo Paciente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-filemaker-text border-b pb-1">DADOS BÁSICOS</h3>
            
            {/* Nome - linha completa */}
            <div className="grid grid-cols-1 gap-4">
              <div>
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
            </div>

            {/* Linha 2: Dados pessoais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-filemaker-text mb-1">DATA NASCIMENTO</label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">IDADE</label>
                <input
                  type="number"
                  value={formData.idade}
                  readOnly
                  className="filemaker-input w-full bg-gray-100"
                  placeholder="Auto"
                />
              </div>
              <div>
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
              <div>
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
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">DATA 1ª CONSULTA</label>
                <input
                  type="date"
                  value={formData.dataPrimeiraConsulta}
                  onChange={(e) => handleInputChange('dataPrimeiraConsulta', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-filemaker-text border-b pb-1">ENDEREÇO</h3>
            
            {/* Linha 1: CEP e Logradouro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-3">
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
              <div className="lg:col-span-6">
                <label className="block text-xs font-medium text-filemaker-text mb-1">LOGRADOURO</label>
                <input
                  type="text"
                  value={formData.endereco.normalizado.logradouro}
                  onChange={(e) => handleInputChange('endereco.normalizado.logradouro', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-filemaker-text mb-1">NÚMERO</label>
                <input
                  type="text"
                  value={formData.endereco.normalizado.numero}
                  onChange={(e) => handleInputChange('endereco.normalizado.numero', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-filemaker-text mb-1">COMPLEMENTO</label>
                <input
                  type="text"
                  value={formData.endereco.normalizado.complemento}
                  onChange={(e) => handleInputChange('endereco.normalizado.complemento', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
            </div>

            {/* Linha 2: Bairro e Cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">BAIRRO</label>
                <input
                  type="text"
                  value={formData.endereco.normalizado.bairro}
                  onChange={(e) => handleInputChange('endereco.normalizado.bairro', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">CIDADE</label>
                <input
                  type="text"
                  value={formData.endereco.normalizado.cidade}
                  onChange={(e) => handleInputChange('endereco.normalizado.cidade', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ESTADO</label>
                <input
                  type="text"
                  value={formData.endereco.normalizado.estado}
                  onChange={(e) => handleInputChange('endereco.normalizado.estado', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-filemaker-text border-b pb-1">CONTATO</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">TELEFONE</label>
                <input
                  type="tel"
                  value={formData.contato.telefone}
                  onChange={(e) => {
                    const formattedPhone = formatPhone(e.target.value)
                    handleInputChange('contato.telefone', formattedPhone)
                  }}
                  className="filemaker-input w-full"
                  placeholder="(00) 0000-0000"
                  maxLength={14}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">CELULAR</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.contato.celular}
                    onChange={(e) => {
                      const formattedCellPhone = formatCellPhone(e.target.value)
                      handleInputChange('contato.celular', formattedCellPhone)
                    }}
                    className="filemaker-input w-full pr-12"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                  <div className="absolute inset-y-0 right-1 flex items-center">
                    <WhatsAppButton phoneNumber={formData.contato.celular} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">PROFISSÃO</label>
                <ProfissaoSelect
                  value={formData.profissao}
                  onChange={(value) => handleInputChange('profissao', value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">EMAIL</label>
                <div className="relative">
                  <EmailInput
                    value={formData.contato.email}
                    onChange={(value) => handleInputChange('contato.email', value)}
                    className="filemaker-input w-full pr-12"
                    showValidation={true}
                  />
                  <div className="absolute inset-y-0 right-1 flex items-center">
                    <EmailButton email={formData.contato.email} />
                  </div>
                  {getFieldError('contato.email') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('contato.email')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Convênio e Documentos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-filemaker-text border-b pb-1">CONVÊNIO E DOCUMENTOS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <label className="block text-xs font-medium text-filemaker-text mb-1">CONVÊNIO</label>
                <ConvenioSelect
                  value={formData.convenio.nome}
                  onChange={(value) => handleInputChange('convenio.nome', value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">STATUS</label>
                <StatusSelect
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">CARTEIRINHA</label>
                <input
                  type="text"
                  value={formData.convenio.carteirinha}
                  onChange={(e) => handleInputChange('convenio.carteirinha', e.target.value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-filemaker-text mb-1">PLANO</label>
                <PlanoSelect
                  value={formData.convenio.plano}
                  onChange={(value) => handleInputChange('convenio.plano', value)}
                  className="filemaker-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">RG</label>
                <input
                  type="text"
                  value={formData.documentos.rg}
                  onChange={(e) => {
                    const formattedRG = formatRG(e.target.value)
                    handleInputChange('documentos.rg', formattedRG)
                  }}
                  className="filemaker-input w-full"
                  placeholder="00.000.000-0"
                  maxLength={12}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">CPF</label>
                <CPFInput
                  value={formData.documentos.cpf}
                  onChange={(value) => handleInputChange('documentos.cpf', value)}
                  className="filemaker-input w-full"
                  showValidation={true}
                />
                {getFieldError('documentos.cpf') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('documentos.cpf')}</p>
                )}
              </div>
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
