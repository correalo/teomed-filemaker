'use client'

import { useState } from 'react'
import { Paciente } from '@/types/paciente'

interface CreatePacienteFormProps {
  onClose: () => void
  onSuccess: (newPaciente: Paciente) => void
}

export default function CreatePacienteForm({ onClose, onSuccess }: CreatePacienteFormProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    idade: '',
    sexo: '',
    prontuario: '',
    indicacao: '',
    endereco: { completo: '' },
    contato: { telefone: '', email: '', celular: '' },
    convenio: { nome: '', carteirinha: '', plano: '' },
    documentos: { rg: '', cpf: '' }
  })

  const handleInputChange = (field: string, value: any) => {
    const fieldParts = field.split('.')
    if (fieldParts.length === 1) {
      setFormData({ ...formData, [field]: value })
    } else {
      const [parentField, childField] = fieldParts
      const parentObject = formData[parentField as keyof typeof formData] || {}
      setFormData({
        ...formData,
        [parentField]: {
          ...(typeof parentObject === 'object' ? parentObject : {}),
          [childField]: value
        }
      })
    }
  }

  const validateRequired = () => {
    if (!formData.nome || !formData.prontuario) {
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      toast.textContent = '⚠️ Nome e Prontuário são obrigatórios'
      document.body.appendChild(toast)
      setTimeout(() => document.body.removeChild(toast), 4000)
      return false
    }
    return true
  }

  const handleCreate = async () => {
    if (!validateRequired()) return
    
    setIsCreating(true)
    try {
      const response = await fetch('http://localhost:3001/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          idade: formData.idade ? parseInt(formData.idade) : undefined,
          prontuario: parseInt(formData.prontuario)
        })
      })

      if (response.ok) {
        const newPaciente = await response.json()
        
        // Toast de sucesso
        const toast = document.createElement('div')
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
        toast.textContent = '✅ Paciente criado com sucesso!'
        document.body.appendChild(toast)
        setTimeout(() => document.body.removeChild(toast), 3000)
        
        onSuccess(newPaciente)
        onClose()
      } else {
        throw new Error('Erro ao criar paciente')
      }
    } catch (error) {
      console.error('Erro ao criar:', error)
      
      // Toast de erro
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      toast.textContent = '❌ Erro ao criar paciente'
      document.body.appendChild(toast)
      setTimeout(() => document.body.removeChild(toast), 3000)
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
            <div className="col-span-4">
              <label className="block text-xs font-medium text-filemaker-text mb-1">NOME *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="filemaker-input w-full font-medium"
                placeholder="Nome completo"
                required
                style={{ borderColor: !formData.nome ? '#ef4444' : undefined }}
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
                onChange={(e) => handleInputChange('idade', e.target.value)}
                className="filemaker-input w-full"
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
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">PRONTUÁRIO *</label>
              <input
                type="number"
                value={formData.prontuario}
                onChange={(e) => handleInputChange('prontuario', e.target.value)}
                className="filemaker-input w-full font-medium"
                required
                style={{ borderColor: !formData.prontuario ? '#ef4444' : undefined }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-filemaker-text mb-1">INDICAÇÃO</label>
              <input
                type="text"
                value={formData.indicacao}
                onChange={(e) => handleInputChange('indicacao', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
          </div>

          {/* Endereço e Contato */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-xs font-medium text-filemaker-text mb-1">ENDEREÇO</label>
              <input
                type="text"
                value={formData.endereco.completo}
                onChange={(e) => handleInputChange('endereco.completo', e.target.value)}
                className="filemaker-input w-full"
              />
            </div>
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
