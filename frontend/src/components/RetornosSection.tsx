import React, { useState } from 'react'
import { Retorno } from '../types/paciente'
import { useToast } from './Toast'

interface RetornosSectionProps {
  pacienteId: string
  retornos: Retorno[]
  dataCirurgia?: string
  onUpdate: (retornos: Retorno[]) => void
  isEditing: boolean
}

const TIPOS_RETORNO = [
  { label: '7 DIAS', dias: 7 },
  { label: '30 DIAS', dias: 30 },
  { label: 'EXAMES 3 MESES', dias: 90 },
  { label: '3 MESES', dias: 90 },
  { label: 'EXAMES 6 MESES', dias: 180 },
  { label: '6 MESES', dias: 180 },
  { label: 'EXAMES 9 MESES', dias: 270 },
  { label: '9 MESES', dias: 270 },
  { label: 'EXAMES 12 MESES', dias: 365 },
  { label: '12 MESES', dias: 365 },
  { label: 'EXAMES 15 MESES', dias: 455 },
  { label: '15 MESES', dias: 455 },
  { label: 'EXAMES 18 MESES', dias: 545 },
  { label: '18 MESES', dias: 545 },
]

export default function RetornosSection({ 
  pacienteId, 
  retornos = [], 
  dataCirurgia,
  onUpdate,
  isEditing 
}: RetornosSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const { success, error } = useToast()

  const calcularDataPrevista = (tipo: string): string => {
    if (!dataCirurgia) return ''
    
    const tipoRetorno = TIPOS_RETORNO.find(t => t.label === tipo)
    if (!tipoRetorno) return ''

    const dataCir = new Date(dataCirurgia)
    dataCir.setDate(dataCir.getDate() + tipoRetorno.dias)
    
    return dataCir.toISOString().split('T')[0]
  }

  const gerarRetornos = () => {
    if (!dataCirurgia) {
      error('Data da cirurgia não definida')
      return
    }

    const novosRetornos: Retorno[] = TIPOS_RETORNO.map(tipo => ({
      tipo: tipo.label,
      data_prevista: calcularDataPrevista(tipo.label),
      realizado: false,
    }))

    onUpdate(novosRetornos)
    setShowModal(false)
    success('Retornos gerados com sucesso!')
  }

  const toggleRealizado = (index: number) => {
    const novosRetornos = [...retornos]
    novosRetornos[index].realizado = !novosRetornos[index].realizado
    
    if (novosRetornos[index].realizado && !novosRetornos[index].data_realizada) {
      novosRetornos[index].data_realizada = new Date().toISOString().split('T')[0]
    }
    
    onUpdate(novosRetornos)
  }

  const atualizarDataRealizada = (index: number, data: string) => {
    const novosRetornos = [...retornos]
    novosRetornos[index].data_realizada = data
    onUpdate(novosRetornos)
  }

  const deletarRetorno = (index: number) => {
    if (confirm('Deseja deletar este retorno?')) {
      const novosRetornos = retornos.filter((_, i) => i !== index)
      onUpdate(novosRetornos)
      success('Retorno deletado!')
    }
  }

  return (
    <div className="filemaker-section mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold bg-filemaker-blue text-white px-2 py-1 rounded">
          DATAS DE RETORNO
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          >
            + GERAR RETORNOS
          </button>
        )}
      </div>

      {retornos.length === 0 ? (
        <p className="text-xs text-gray-500 italic">Nenhum retorno cadastrado. {isEditing ? 'Clique em "GERAR RETORNOS" para criar automaticamente.' : ''}</p>
      ) : (
        <div className="space-y-2">
          {retornos.map((retorno, index) => (
            <div 
              key={index} 
              className="grid grid-cols-12 gap-2 items-center text-xs border-b border-gray-200 pb-2"
            >
              {/* Tipo */}
              <div className="col-span-3 font-medium">
                {retorno.tipo}
              </div>

              {/* Data Prevista */}
              <div className="col-span-3">
                <input
                  type="date"
                  value={retorno.data_prevista?.split('T')[0] || ''}
                  readOnly={!isEditing}
                  onChange={(e) => {
                    const novosRetornos = [...retornos]
                    novosRetornos[index].data_prevista = e.target.value
                    onUpdate(novosRetornos)
                  }}
                  className="filemaker-input w-full text-xs"
                  style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
                />
              </div>

              {/* Data Realizada */}
              <div className="col-span-3">
                <input
                  type="date"
                  value={retorno.data_realizada?.split('T')[0] || ''}
                  readOnly={!isEditing}
                  onChange={(e) => atualizarDataRealizada(index, e.target.value)}
                  className="filemaker-input w-full text-xs"
                  style={{ backgroundColor: isEditing ? '#fff' : '#f9f9f9' }}
                />
              </div>

              {/* Checkbox Realizado */}
              <div className="col-span-2 flex items-center justify-center gap-1">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retorno.realizado}
                    disabled={!isEditing}
                    onChange={() => toggleRealizado(index)}
                    className="cursor-pointer"
                  />
                  <span className={retorno.realizado ? 'text-green-600 font-semibold' : 'text-red-600'}>
                    {retorno.realizado ? 'SIM' : 'NÃO'}
                  </span>
                </label>
              </div>

              {/* Botão Deletar */}
              {isEditing && (
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => deletarRetorno(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Deletar retorno"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para Gerar Retornos */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Gerar Retornos Automáticos</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Data da Cirurgia: <strong>{dataCirurgia ? new Date(dataCirurgia).toLocaleDateString('pt-BR') : 'Não definida'}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Serão gerados {TIPOS_RETORNO.length} retornos automáticos baseados na data da cirurgia.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 max-h-96 overflow-y-auto">
              {TIPOS_RETORNO.map((tipo, index) => {
                const dataPrevista = calcularDataPrevista(tipo.label)
                return (
                  <div key={index} className="border border-gray-200 rounded p-2 text-sm">
                    <div className="font-semibold">{tipo.label}</div>
                    <div className="text-xs text-gray-600">
                      {dataPrevista ? new Date(dataPrevista).toLocaleDateString('pt-BR') : '-'}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={gerarRetornos}
                disabled={!dataCirurgia}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Gerar Retornos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
