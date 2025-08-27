'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface PortalSectionProps {
  pacienteId: string
  isSearchMode?: boolean
  searchFields?: any
  onSearchFieldChange?: (field: string, value: string) => void
}

const api = axios.create({
  baseURL: 'http://localhost:3005',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default function PortalSection({ pacienteId, isSearchMode = false, searchFields = {}, onSearchFieldChange }: PortalSectionProps) {
  const [activeTab, setActiveTab] = useState('evolucoes')

  const { data: evolucoes } = useQuery({
    queryKey: ['evolucoes', pacienteId],
    queryFn: () => api.get(`/evolucoes/paciente/${pacienteId}`).then(res => res.data),
    enabled: activeTab === 'evolucoes'
  })

  const { data: avaliacoes } = useQuery({
    queryKey: ['avaliacoes', pacienteId],
    queryFn: () => api.get(`/avaliacoes/paciente/${pacienteId}`).then(res => res.data),
    enabled: activeTab === 'avaliacoes'
  })

  const { data: examesPreop } = useQuery({
    queryKey: ['exames-preop', pacienteId],
    queryFn: () => api.get(`/exames-preop/paciente/${pacienteId}`).then(res => res.data),
    enabled: activeTab === 'exames-preop'
  })

  const { data: receitas } = useQuery({
    queryKey: ['receitas', pacienteId],
    queryFn: () => api.get(`/receitas/paciente/${pacienteId}`).then(res => res.data),
    enabled: activeTab === 'receitas'
  })

  const tabs = [
    { id: 'evolucoes', label: 'EVOLUÇÃO', color: 'bg-filemaker-green' },
    { id: 'avaliacoes', label: 'AVALIAÇÕES', color: 'bg-filemaker-blue' },
    { id: 'exames-preop', label: 'EXAMES PRÉ-OP', color: 'bg-filemaker-orange' },
    { id: 'receitas', label: 'RECEITAS', color: 'bg-filemaker-red' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'evolucoes':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-filemaker-header">Evoluções do Paciente</h3>
            {evolucoes?.length > 0 ? (
              <div className="space-y-3">
                {evolucoes.map((evolucao: any, index: number) => (
                  <div key={`evolucao-${index}-${evolucao.data_retorno || index}`} className="filemaker-card p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">DATA</label>
                        <div className="text-sm">{evolucao.data_retorno}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">DELTA T</label>
                        <div className="text-sm">{evolucao.delta_t}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">PESO</label>
                        <div className="text-sm">{evolucao.peso} kg</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">DELTA PESO</label>
                        <div className="text-sm">{evolucao.delta_peso} kg</div>
                      </div>
                    </div>
                    {evolucao.exames_alterados && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-filemaker-text mb-1">EXAMES ALTERADOS</label>
                        <div className="text-sm">{evolucao.exames_alterados}</div>
                      </div>
                    )}
                    {evolucao.medicacoes?.length > 0 && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-filemaker-text mb-1">MEDICAÇÕES</label>
                        <div className="text-sm">{evolucao.medicacoes.join(', ')}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma evolução cadastrada para este paciente
              </div>
            )}
          </div>
        )

      case 'avaliacoes':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-filemaker-header">Avaliações Médicas</h3>
            {avaliacoes?.length > 0 ? (
              <div className="space-y-3">
                {avaliacoes.map((avaliacao: any, index: number) => (
                  <div key={`avaliacao-${index}-${avaliacao.data || index}`} className="filemaker-card p-4">
                    {/* Header da Avaliação */}
                    <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b border-gray-200">
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">STATUS</label>
                        <div className={`text-sm px-2 py-1 rounded text-white ${
                          avaliacao.status === 'pendente' ? 'bg-filemaker-yellow' : 
                          avaliacao.status === 'completo' ? 'bg-filemaker-green' : 'bg-gray-400'
                        }`}>
                          {avaliacao.status.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">DATA CADASTRO</label>
                        <div className="text-sm">{new Date(avaliacao.data_cadastro).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">PACIENTE</label>
                        <div className="text-sm font-medium">{avaliacao.nome_paciente}</div>
                      </div>
                    </div>
                    
                    {/* Avaliações por Especialidade */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {Object.entries(avaliacao.avaliacoes || {}).map(([especialidade, dados]: [string, any]) => (
                        <div key={`esp-${especialidade}-${index}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h4 className="text-sm font-bold mb-3 uppercase bg-filemaker-blue text-white px-2 py-1 rounded">
                            {especialidade === 'cardiologista' ? 'CARDIOLOGIA' :
                             especialidade === 'endocrinologista' ? 'ENDOCRINOLOGIA' :
                             especialidade === 'nutricionista' ? 'NUTRIÇÃO' :
                             especialidade === 'psicologia' ? 'PSICOLOGIA' :
                             especialidade === 'outros' ? 'OUTRAS ESPECIALIDADES' : especialidade}
                          </h4>
                          
                          <div className="space-y-2">
                            {/* Status do Arquivo */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-filemaker-text">Arquivo:</span>
                              <div className={`px-2 py-1 rounded text-xs text-white ${
                                dados.tem_arquivo ? 'bg-filemaker-green' : 'bg-filemaker-red'
                              }`}>
                                {dados.tem_arquivo ? 'ANEXADO' : 'PENDENTE'}
                              </div>
                            </div>

                            {/* Nome do Arquivo */}
                            {dados.nome_arquivo && (
                              <div>
                                <span className="text-xs text-filemaker-text">Arquivo:</span>
                                <div className="text-sm font-medium">{dados.nome_arquivo}</div>
                              </div>
                            )}

                            {/* Data de Upload */}
                            {dados.data_upload && (
                              <div>
                                <span className="text-xs text-filemaker-text">Data Upload:</span>
                                <div className="text-sm">{new Date(dados.data_upload).toLocaleDateString('pt-BR')}</div>
                              </div>
                            )}

                            {/* Data da Avaliação */}
                            {dados.data_avaliacao && (
                              <div>
                                <span className="text-xs text-filemaker-text">Data Avaliação:</span>
                                <div className="text-sm">{new Date(dados.data_avaliacao).toLocaleDateString('pt-BR')}</div>
                              </div>
                            )}

                            {/* Profissional */}
                            {dados.profissional && (
                              <div>
                                <span className="text-xs text-filemaker-text">Profissional:</span>
                                <div className="text-sm font-medium">{dados.profissional}</div>
                              </div>
                            )}

                            {/* Registro Profissional */}
                            {dados.registro && (
                              <div>
                                <span className="text-xs text-filemaker-text">Registro:</span>
                                <div className="text-sm">{dados.registro}</div>
                              </div>
                            )}

                            {/* Especialidade (apenas para "outros") */}
                            {especialidade === 'outros' && dados.especialidade && (
                              <div>
                                <span className="text-xs text-filemaker-text">Especialidade:</span>
                                <div className="text-sm font-medium">{dados.especialidade}</div>
                              </div>
                            )}

                            {/* Observações */}
                            {dados.observacoes && (
                              <div>
                                <span className="text-xs text-filemaker-text">Observações:</span>
                                <div className="text-sm bg-white p-2 rounded border">{dados.observacoes}</div>
                              </div>
                            )}

                            {/* Tipo MIME (se houver arquivo) */}
                            {dados.mime_type && (
                              <div>
                                <span className="text-xs text-filemaker-text">Tipo:</span>
                                <div className="text-xs text-gray-600">{dados.mime_type}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Observações Gerais */}
                    {avaliacao.observacoes_gerais && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <label className="block text-xs font-medium text-filemaker-text mb-1">OBSERVAÇÕES GERAIS</label>
                        <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                          {avaliacao.observacoes_gerais}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma avaliação cadastrada para este paciente
              </div>
            )}
          </div>
        )

      case 'exames-preop':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-filemaker-header">Exames Pré-Operatórios</h3>
            {examesPreop?.length > 0 ? (
              <div className="space-y-3">
                {examesPreop.map((exame: any, index: number) => (
                  <div key={`exame-${index}-${exame.status || index}`} className="filemaker-card p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">STATUS</label>
                        <div className="text-sm">{exame.status}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">DATA CADASTRO</label>
                        <div className="text-sm">{new Date(exame.data_cadastro).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">CIRURGIA PREVISTA</label>
                        <div className="text-sm">
                          {exame.data_cirurgia_prevista 
                            ? new Date(exame.data_cirurgia_prevista).toLocaleDateString('pt-BR')
                            : 'Não definida'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(exame.exames || {}).map(([tipoExame, dados]: [string, any]) => (
                        <div key={`tipo-${tipoExame}-${index}`} className="border border-gray-200 rounded p-2">
                          <h4 className="text-xs font-medium text-filemaker-header mb-1 uppercase">
                            {tipoExame}
                          </h4>
                          <div className="text-xs">
                            <div className={`inline-block px-2 py-1 rounded text-white ${
                              dados.tem_arquivo ? 'bg-green-500' : 'bg-gray-400'
                            }`}>
                              {dados.tem_arquivo ? 'Anexado' : 'Pendente'}
                            </div>
                            {dados.observacoes && (
                              <div className="mt-1 text-gray-600">{dados.observacoes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum exame pré-operatório cadastrado para este paciente
              </div>
            )}
          </div>
        )

      case 'receitas':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-filemaker-header">Receitas Médicas</h3>
            {receitas?.length > 0 ? (
              <div className="space-y-3">
                {receitas.map((receita: any, index: number) => (
                  <div key={`receita-${index}-${receita.data_emissao || index}`} className="filemaker-card p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">DATA EMISSÃO</label>
                        <div className="text-sm">{new Date(receita.data_emissao).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">MÉDICO</label>
                        <div className="text-sm">{receita.medico?.nome || 'Não informado'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-filemaker-text mb-1">CRM</label>
                        <div className="text-sm">{receita.medico?.crm || 'Não informado'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-filemaker-text mb-2">MEDICAMENTOS</label>
                      <div className="space-y-2">
                        {receita.medicamentos?.map((med: any, medIndex: number) => (
                          <div key={`med-${medIndex}-${med.nome || medIndex}`} className="border border-gray-200 rounded p-3">
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <span className="text-xs text-filemaker-text">Nome:</span>
                                <div className="text-sm font-medium">{med.nome}</div>
                              </div>
                              <div>
                                <span className="text-xs text-filemaker-text">Dosagem:</span>
                                <div className="text-sm">{med.dosagem}</div>
                              </div>
                              <div>
                                <span className="text-xs text-filemaker-text">Posologia:</span>
                                <div className="text-sm">{med.posologia}</div>
                              </div>
                              <div>
                                <span className="text-xs text-filemaker-text">Duração:</span>
                                <div className="text-sm">{med.duracao}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma receita cadastrada para este paciente
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Clinical Cards - Always visible in search mode */}
      {isSearchMode && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Avaliação Clínica */}
          <div className="filemaker-card p-4">
            <h3 className="text-sm font-bold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
              AVALIAÇÃO CLÍNICA
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-filemaker-text mb-1">PESO</label>
                  <input
                    type="number"
                    value={searchFields.peso || ''}
                    onChange={(e) => onSearchFieldChange?.('peso', e.target.value)}
                    className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                    style={{ backgroundColor: '#fef3e2' }}
                    placeholder="120.3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-filemaker-text mb-1">ALTURA</label>
                  <input
                    type="number"
                    value={searchFields.altura || ''}
                    onChange={(e) => onSearchFieldChange?.('altura', e.target.value)}
                    className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                    style={{ backgroundColor: '#fef3e2' }}
                    placeholder="1.63"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-filemaker-text mb-1">IMC</label>
                  <input
                    type="number"
                    value={searchFields.imc || ''}
                    onChange={(e) => onSearchFieldChange?.('imc', e.target.value)}
                    className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                    style={{ backgroundColor: '#fef3e2' }}
                    placeholder="45.28"
                  />
                </div>
              </div>
              
              {/* Checkboxes - Primeira coluna */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has"
                      checked={searchFields.has || false}
                      onChange={(e) => onSearchFieldChange?.('has', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="has" className="text-xs text-filemaker-text">HAS</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dislipidemia"
                      checked={searchFields.dislipidemia || false}
                      onChange={(e) => onSearchFieldChange?.('dislipidemia', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="dislipidemia" className="text-xs text-filemaker-text">DISLIPIDEMIA</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="artropatias"
                      checked={searchFields.artropatias || false}
                      onChange={(e) => onSearchFieldChange?.('artropatias', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="artropatias" className="text-xs text-filemaker-text">ARTROPATIAS</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="esteatose"
                      checked={searchFields.esteatose || false}
                      onChange={(e) => onSearchFieldChange?.('esteatose', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="esteatose" className="text-xs text-filemaker-text">ESTEATOSE</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="refluxo"
                      checked={searchFields.refluxo || false}
                      onChange={(e) => onSearchFieldChange?.('refluxo', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="refluxo" className="text-xs text-filemaker-text">REFLUXO</label>
                  </div>
                </div>
                
                {/* Checkboxes - Segunda coluna */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="diabetes"
                      checked={searchFields.diabetes || false}
                      onChange={(e) => onSearchFieldChange?.('diabetes', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="diabetes" className="text-xs text-filemaker-text">DIABETES</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anemia"
                      checked={searchFields.anemia || false}
                      onChange={(e) => onSearchFieldChange?.('anemia', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="anemia" className="text-xs text-filemaker-text">ANEMIA</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ccc"
                      checked={searchFields.ccc || false}
                      onChange={(e) => onSearchFieldChange?.('ccc', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="ccc" className="text-xs text-filemaker-text">CCC</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hernia_hiato"
                      checked={searchFields.hernia_hiato || false}
                      onChange={(e) => onSearchFieldChange?.('hernia_hiato', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="hernia_hiato" className="text-xs text-filemaker-text">HÉRNIA DE HIATO</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hernia_incisional"
                      checked={searchFields.hernia_incisional || false}
                      onChange={(e) => onSearchFieldChange?.('hernia_incisional', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="hernia_incisional" className="text-xs text-filemaker-text">HÉRNIA INCISIONAL</label>
                  </div>
                </div>
              </div>
              
              {/* Cirurgia Prévia */}
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">CIRURGIA PRÉVIA</label>
                <input
                  type="text"
                  value={searchFields.cirurgia_previa || ''}
                  onChange={(e) => onSearchFieldChange?.('cirurgia_previa', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar cirurgia prévia..."
                />
              </div>
            </div>
          </div>

          {/* Antecedentes */}
          <div className="filemaker-card p-4">
            <h3 className="text-sm font-bold mb-3 bg-filemaker-green text-white px-2 py-1 rounded">
              ANTECEDENTES
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ANTECEDENTE PATERNO</label>
                <input
                  type="text"
                  value={searchFields.antecedente_paterno || ''}
                  onChange={(e) => onSearchFieldChange?.('antecedente_paterno', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar antecedente paterno..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ANTECEDENTE MATERNO</label>
                <input
                  type="text"
                  value={searchFields.antecedente_materno || ''}
                  onChange={(e) => onSearchFieldChange?.('antecedente_materno', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar antecedente materno..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ANTECEDENTE TIOS</label>
                <input
                  type="text"
                  value={searchFields.antecedente_tios || ''}
                  onChange={(e) => onSearchFieldChange?.('antecedente_tios', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar antecedente tios..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">ANTECEDENTE AVÓS</label>
                <input
                  type="text"
                  value={searchFields.antecedente_avos || ''}
                  onChange={(e) => onSearchFieldChange?.('antecedente_avos', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar antecedente avós..."
                />
              </div>
            </div>
          </div>

          {/* Medicamentos Pré-Op */}
          <div className="filemaker-card p-4">
            <h3 className="text-sm font-bold mb-3 bg-filemaker-orange text-white px-2 py-1 rounded">
              MEDICAMENTOS PRÉ-OP
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">MEDICAMENTO</label>
                <input
                  type="text"
                  value={searchFields.medicamento_preop || ''}
                  onChange={(e) => onSearchFieldChange?.('medicamento_preop', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar medicamento..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">DOSAGEM</label>
                <input
                  type="text"
                  value={searchFields.dosagem_preop || ''}
                  onChange={(e) => onSearchFieldChange?.('dosagem_preop', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar dosagem..."
                />
              </div>
            </div>
          </div>

          {/* Tratamentos */}
          <div className="filemaker-card p-4">
            <h3 className="text-sm font-bold mb-3 bg-filemaker-blue text-white px-2 py-1 rounded">
              TRATAMENTOS
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">DATA</label>
                <input
                  type="date"
                  value={searchFields.data_cirurgia || ''}
                  onChange={(e) => onSearchFieldChange?.('data_cirurgia', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">LOCAL</label>
                <input
                  type="text"
                  value={searchFields.local_cirurgia || ''}
                  onChange={(e) => onSearchFieldChange?.('local_cirurgia', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar local..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-filemaker-text mb-1">TRATAMENTO</label>
                <input
                  type="text"
                  value={searchFields.tratamento || ''}
                  onChange={(e) => onSearchFieldChange?.('tratamento', e.target.value)}
                  className="filemaker-input w-full text-sm bg-orange-50 border-orange-300 focus:border-orange-500"
                  style={{ backgroundColor: '#fef3e2' }}
                  placeholder="Buscar tratamento..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Original Portal Section - Hidden in search mode */}
      {!isSearchMode && (
        <div className="filemaker-card">
          {/* Tabs */}
          <div className="flex border-b border-filemaker-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? `${tab.color} text-white border-transparent`
                    : 'text-filemaker-text hover:text-filemaker-header border-transparent hover:border-filemaker-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  )
}
