'use client'

import { Paciente } from '@/types/paciente'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PacienteCardProps {
  paciente: Paciente
}

export default function PacienteCard({ paciente }: PacienteCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateString
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

  return (
    <div className="filemaker-card p-6">
      {/* Header with patient basic info */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-4">
          <label className="block text-xs font-medium text-filemaker-text mb-1">NOME</label>
          <input
            type="text"
            value={paciente?.nome || ''}
            readOnly
            className="filemaker-input w-full font-medium text-filemaker-header"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">Birthday</label>
          <input
            type="text"
            value={paciente?.dataNascimento ? formatDate(paciente.dataNascimento) : ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">IDADE</label>
          <input
            type="text"
            value={paciente?.idade || ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-filemaker-text mb-1">SEXO</label>
          <input
            type="text"
            value={paciente?.sexo || ''}
            readOnly
            className="filemaker-input w-full"
          />
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
            type="text"
            value={paciente?.prontuario || ''}
            readOnly
            className="filemaker-input w-full font-medium"
          />
        </div>
      </div>

      {/* Address and Contact */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">INDICAÇÃO</label>
          <input
            type="text"
            value={paciente.indicacao}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-6">
          <label className="block text-xs font-medium text-filemaker-text mb-1">ENDEREÇO</label>
          <input
            type="text"
            value={paciente.endereco?.completo || ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">CELULAR</label>
          <input
            type="text"
            value={paciente.contato?.celular || paciente.contato?.telefone || ''}
            readOnly
            className="filemaker-input w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-filemaker-text mb-1">Email</label>
          <input
            type="text"
            value={paciente.contato?.email || ''}
            readOnly
            className="filemaker-input w-full"
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
