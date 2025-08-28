'use client'

import React, { useState } from 'react'
import { Paciente } from '../types/paciente'

interface TratamentosCardProps {
  paciente: Paciente
  isEditing: boolean
  isSearchMode: boolean
  searchFields: any
  onSearchFieldChange?: (field: string, value: string) => void
  onUpdate: (updatedData: Partial<Paciente>) => void
}

export default function TratamentosCard({
  paciente,
  isEditing,
  isSearchMode,
  searchFields,
  onSearchFieldChange,
  onUpdate
}: TratamentosCardProps) {
  const [currentData, setCurrentData] = useState(paciente)

  const handleInputChange = (field: string, value: string | boolean) => {
    const updatedData = { ...currentData }
    
    if (field.includes('.')) {
      const keys = field.split('.')
      let obj = updatedData as any
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
    } else {
      (updatedData as any)[field] = value
    }
    
    setCurrentData(updatedData)
    onUpdate(updatedData)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const handleDateChange = (field: string, value: string) => {
    const isoDate = value ? new Date(value).toISOString() : ''
    handleInputChange(field, isoDate)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-filemaker-text">TRATAMENTOS</h3>
      </div>

      <div className="space-y-4">
        {/* Linha 1: Data Cirurgia e Local */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-filemaker-text mb-1">DATA CIRURGIA</label>
            <input
              type="date"
              value={isSearchMode ? (searchFields.data_cirurgia || '') : formatDate(currentData?.cirurgia?.data || '')}
              readOnly={!isEditing && !isSearchMode}
              onChange={(e) => {
                if (isSearchMode) {
                  onSearchFieldChange?.('data_cirurgia', e.target.value)
                } else {
                  handleDateChange('cirurgia.data', e.target.value)
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
            <input
              type="text"
              value={isSearchMode ? (searchFields.local_cirurgia || '') : (currentData?.cirurgia?.local || '')}
              readOnly={!isEditing && !isSearchMode}
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
              placeholder={isSearchMode ? "Buscar por local..." : "Ex: SANTA CATARINA"}
            />
          </div>
        </div>

        {/* Linha 2: Tratamento e Tipo de Cirurgia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-filemaker-text mb-1">TRATAMENTO</label>
            <select
              value={isSearchMode ? (searchFields.tratamento || '') : (currentData?.cirurgia?.tratamento || '')}
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
              value={isSearchMode ? (searchFields.tipo_cirurgia || '') : (currentData?.cirurgia?.tipo || '')}
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
              value={isSearchMode ? (searchFields.segunda_cirurgia || '') : (currentData?.cirurgia?.segunda_cirurgia || '')}
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
              value={isSearchMode ? (searchFields.data_segunda_cirurgia || '') : formatDate(currentData?.cirurgia?.data_segunda_cirurgia || '')}
              readOnly={!isEditing && !isSearchMode}
              onChange={(e) => {
                if (isSearchMode) {
                  onSearchFieldChange?.('data_segunda_cirurgia', e.target.value)
                } else {
                  handleDateChange('cirurgia.data_segunda_cirurgia', e.target.value)
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
              value={isSearchMode ? (searchFields.petersen_fechado || '') : (currentData?.cirurgia?.petersenFechado ? 'SIM' : 'NÃO')}
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
              value={isSearchMode ? (searchFields.tamanho_alcas || '') : (currentData?.cirurgia?.tamanho_alcas || '')}
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
  )
}
