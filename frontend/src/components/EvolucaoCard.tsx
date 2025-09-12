import React, { useState, useEffect, useCallback } from 'react';
import { Evolucao, EvolucaoSearchFields } from '../types/evolucao';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/utils/api';
import { useToast } from './Toast';

interface EvolucaoCardProps {
  pacienteId: string;
  pacienteNome?: string;
  evolucoes: Evolucao[];
  isEditing: boolean;
  isSearchMode: boolean;
  onUpdate?: (evolucoes: Evolucao[]) => void;
  onSearch?: (searchFields: EvolucaoSearchFields) => void;
}

const EvolucaoCard: React.FC<EvolucaoCardProps> = ({
  pacienteId,
  pacienteNome: pacienteNomeProp,
  evolucoes = [],
  isEditing,
  isSearchMode,
  onUpdate,
  onSearch,
}) => {
  const [editedEvolucoes, setEditedEvolucoes] = useState<Evolucao[]>([]);
  const [searchFields, setSearchFields] = useState<EvolucaoSearchFields>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [paciente, setPaciente] = useState<any>({});
  const [pacienteNome, setPacienteNome] = useState<string>(pacienteNomeProp || '');
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const [newEvolucao, setNewEvolucao] = useState<Evolucao>({
    paciente_id: pacienteId,
    nome_paciente: pacienteNomeProp || '',
    data_retorno: format(new Date(), 'yyyy-MM-dd'),
    delta_t: '',
    peso: 0,
    delta_peso: 0,
    exames_alterados: '',
    medicacoes: [],
  });
  
  // Buscar o nome do paciente quando o componente for montado ou o pacienteId mudar
  const fetchPacienteNome = useCallback(async () => {
    if (!pacienteId) return;
    
    try {
      // Usar a API centralizada para buscar dados do paciente
      const response = await api.get(`/pacientes/${pacienteId}`);
      const data = response.data;
      setPaciente(data);
      setPacienteNome(data.nome || '');
      
      // Atualizar o nome do paciente no novo objeto de evolução apenas se necessário
      setNewEvolucao(prev => {
        if (prev.nome_paciente !== data.nome) {
          return {
            ...prev,
            nome_paciente: data.nome || ''
          };
        }
        return prev;
      });
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error instanceof Error ? error.message : String(error));
    }
  }, [pacienteId]);

  useEffect(() => {
    if (pacienteId) {
      fetchPacienteNome();
    }
  }, [pacienteId, fetchPacienteNome]);

  useEffect(() => {
    if (pacienteNomeProp) {
      setPacienteNome(pacienteNomeProp);
      // Atualizar também o newEvolucao com o nome correto
      setNewEvolucao(prev => ({
        ...prev,
        nome_paciente: pacienteNomeProp
      }));
    } else if (pacienteId) {
      fetchPacienteNome();
    }
  }, [pacienteId, pacienteNomeProp, fetchPacienteNome]);

  useEffect(() => {
    if (JSON.stringify(editedEvolucoes) !== JSON.stringify(evolucoes)) {
      setEditedEvolucoes(evolucoes);
    }
  }, [evolucoes, editedEvolucoes]);

  const handleInputChange = (index: number, field: keyof Evolucao, value: any) => {
    const updatedEvolucoes = [...editedEvolucoes];
    updatedEvolucoes[index] = {
      ...updatedEvolucoes[index],
      [field]: value
    };
    setEditedEvolucoes(updatedEvolucoes);
  };

  const handleSearchChange = (field: keyof EvolucaoSearchFields, value: any) => {
    if (isSearchMode) {
      // Se o valor estiver vazio, remover o campo dos critérios de busca
      const updatedSearchFields = {
        ...searchFields,
        [field]: value,
      };
      
      // Se o valor estiver vazio, definir como undefined para não incluir na busca
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        updatedSearchFields[field] = undefined;
      }
      
      setSearchFields(updatedSearchFields);
      if (onSearch) {
        onSearch(updatedSearchFields);
      }
    }
  };

  // Função para criar nova evolução
  const handleCreateEvolucao = async () => {
    if (!newEvolucao.data_retorno) {
      toast.warning('Data de retorno é obrigatória');
      return;
    }

    setIsSaving(true);
    try {
      const evolucaoToCreate = {
        ...newEvolucao,
        nome_paciente: newEvolucao.nome_paciente || pacienteNome,
        paciente_id: pacienteId
      };

      const response = await api.post('/evolucoes', evolucaoToCreate);
      
      if (response.data) {
        const updatedEvolucoes = [...editedEvolucoes, response.data];
        setEditedEvolucoes(updatedEvolucoes);
        if (onUpdate) {
          onUpdate(updatedEvolucoes);
        }
        
        // Resetar formulário
        setNewEvolucao({
          paciente_id: pacienteId,
          nome_paciente: pacienteNome,
          data_retorno: format(new Date(), 'yyyy-MM-dd'),
          delta_t: '',
          peso: 0,
          delta_peso: 0,
          exames_alterados: '',
          medicacoes: [],
        });
        setShowAddForm(false);
        toast.success('Evolução criada com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao criar evolução:', error);
      toast.error(`Erro ao criar evolução: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para salvar alterações nas evoluções existentes
  const handleSaveEvolucoes = async () => {
    setIsSaving(true);
    try {
      const promises = editedEvolucoes.map(async (evolucao) => {
        if (evolucao._id) {
          return await api.put(`/evolucoes/${evolucao._id}`, evolucao);
        }
        return evolucao;
      });

      await Promise.all(promises);
      setIsEditingLocal(false);
      toast.success('Evoluções salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar evoluções:', error);
      toast.error(`Erro ao salvar evoluções: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para deletar evolução
  const handleDeleteEvolucao = async (evolucaoId: string, index: number) => {
    if (!confirm('Tem certeza que deseja deletar esta evolução?')) {
      return;
    }

    try {
      await api.delete(`/evolucoes/${evolucaoId}`);
      
      const updatedEvolucoes = editedEvolucoes.filter((_, i) => i !== index);
      setEditedEvolucoes(updatedEvolucoes);
      if (onUpdate) {
        onUpdate(updatedEvolucoes);
      }
      
      toast.success('Evolução deletada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar evolução:', error);
      toast.error(`Erro ao deletar evolução: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // Verifica se já está no formato dd/MM/yyyy
      const parts = dateString.split('/');
      if (parts.length === 3) {
        return dateString; // Já está no formato correto
      }
      
      // Converte do formato ISO (yyyy-MM-dd) para dd/MM/yyyy
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Se não for uma data válida, retorna o original
      }
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-filemaker-blue">EVOLUÇÃO</h2>
        
        {/* Botões CRUD */}
        <div className="flex gap-2">
          {!isSearchMode && (
            <>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                disabled={isSaving}
              >
                <span>➕</span>
                {showAddForm ? 'Cancelar' : 'Criar Nova'}
              </button>
              
              <button
                onClick={() => setIsEditingLocal(!isEditingLocal)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                disabled={isSaving}
              >
                <span>✏️</span>
                {isEditingLocal ? 'Cancelar Edição' : 'Editar'}
              </button>
              
              {isEditingLocal && (
                <button
                  onClick={handleSaveEvolucoes}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                  disabled={isSaving}
                >
                  <span>💾</span>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isSearchMode && (
        <div className="mb-4 p-3 bg-orange-100 rounded-md">
          <div className="grid grid-cols-7 gap-2 mb-2">
            <div className="font-bold text-xs text-filemaker-text">NOME</div>
            <div className="font-bold text-xs text-filemaker-text">DATA</div>
            <div className="font-bold text-xs text-filemaker-text">DELTA T</div>
            <div className="font-bold text-xs text-filemaker-text">PESO</div>
            <div className="font-bold text-xs text-filemaker-text">DELTA PESO</div>
            <div className="font-bold text-xs text-filemaker-text">EXAMES ALTERADOS</div>
            <div className="font-bold text-xs text-filemaker-text">MEDICAÇÕES</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            <input
              type="text"
              value={searchFields.nome_paciente || pacienteNome || ''}
              onChange={(e) => handleSearchChange('nome_paciente', e.target.value)}
              className="border rounded p-1 text-sm bg-[#fef3e2]"
              placeholder="Buscar nome..."
            />
            <input
              type="text"
              value={searchFields.data_retorno || ''}
              onChange={(e) => handleSearchChange('data_retorno', e.target.value)}
              className="border rounded p-1 text-sm bg-[#fef3e2]"
              placeholder="dd/mm/aaaa"
            />
            <input
              type="text"
              value={searchFields.delta_t || ''}
              onChange={(e) => handleSearchChange('delta_t', e.target.value)}
              className="border rounded p-1 text-sm bg-[#fef3e2]"
              placeholder="Buscar delta T..."
            />
            <input
              type="text"
              value={searchFields.peso || ''}
              onChange={(e) => handleSearchChange('peso', e.target.value)}
              className="border rounded p-1 text-sm bg-[#fef3e2]"
              placeholder="Buscar peso..."
            />
            <input
              type="text"
              value={searchFields.delta_peso || ''}
              onChange={(e) => handleSearchChange('delta_peso', e.target.value)}
              className="border rounded p-1 text-sm bg-[#fef3e2]"
              placeholder="Buscar delta peso..."
            />
            <input
              type="text"
              value={searchFields.exames_alterados || ''}
              onChange={(e) => handleSearchChange('exames_alterados', e.target.value)}
              className="border rounded p-1 text-sm bg-[#fef3e2]"
              placeholder="Buscar exames..."
            />
            <input
              type="text"
              value={searchFields.medicacoes || ''}
              onChange={(e) => handleSearchChange('medicacoes', e.target.value)}
              className="border rounded p-1 text-sm bg-[#fef3e2]"
              placeholder="Buscar medicações..."
            />
          </div>
        </div>
      )}

      {showAddForm && isEditing && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md">
          <div className="grid grid-cols-7 gap-2 mb-2">
            <div className="font-bold text-xs text-filemaker-text">NOME</div>
            <div className="font-bold text-xs text-filemaker-text">DATA</div>
            <div className="font-bold text-xs text-filemaker-text">DELTA T</div>
            <div className="font-bold text-xs text-filemaker-text">PESO</div>
            <div className="font-bold text-xs text-filemaker-text">DELTA PESO</div>
            <div className="font-bold text-xs text-filemaker-text">EXAMES ALTERADOS</div>
            <div className="font-bold text-xs text-filemaker-text">MEDICAÇÕES</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            <input
              type="text"
              value={newEvolucao.nome_paciente || pacienteNome}
              onChange={(e) => setNewEvolucao({ ...newEvolucao, nome_paciente: e.target.value })}
              className="border rounded p-1 text-sm"
              readOnly={true} // Nome do paciente não deve ser editável
              title="Nome do paciente obtido automaticamente"
            />
            <input
              type="date"
              value={newEvolucao.data_retorno}
              onChange={(e) => setNewEvolucao({ ...newEvolucao, data_retorno: e.target.value })}
              className="border rounded p-1 text-sm"
            />
            <input
              type="text"
              value={newEvolucao.delta_t}
              onChange={(e) => setNewEvolucao({ ...newEvolucao, delta_t: e.target.value })}
              className="border rounded p-1 text-sm"
              placeholder="ex: 4 MESES"
            />
            <input
              type="number"
              value={newEvolucao.peso || ''}
              onChange={(e) => setNewEvolucao({ ...newEvolucao, peso: parseFloat(e.target.value) })}
              className="border rounded p-1 text-sm"
              step="0.1"
            />
            <input
              type="number"
              value={newEvolucao.delta_peso || ''}
              onChange={(e) => setNewEvolucao({ ...newEvolucao, delta_peso: parseFloat(e.target.value) })}
              className="border rounded p-1 text-sm"
              step="0.1"
            />
            <input
              type="text"
              value={newEvolucao.exames_alterados}
              onChange={(e) => setNewEvolucao({ ...newEvolucao, exames_alterados: e.target.value })}
              className="border rounded p-1 text-sm"
            />
            <input
              type="text"
              value={Array.isArray(newEvolucao.medicacoes) ? newEvolucao.medicacoes.join(', ') : ''}
              onChange={(e) => setNewEvolucao({ ...newEvolucao, medicacoes: e.target.value.split(',').map(item => item.trim()) })}
              className="border rounded p-1 text-sm"
              placeholder="Separar por vírgulas"
            />
          </div>
          <div className="mt-2 text-right">
            <button
              onClick={handleCreateEvolucao}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
              disabled={isSaving}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-3 text-left text-xs font-medium text-filemaker-text">NOME</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-filemaker-text">DATA</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-filemaker-text">DELTA T</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-filemaker-text">PESO</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-filemaker-text">DELTA PESO</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-filemaker-text">EXAMES ALTERADOS</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-filemaker-text">MEDICAÇÕES</th>
              {(isEditingLocal || !isSearchMode) && (
                <th className="py-2 px-3 text-left text-xs font-medium text-filemaker-text">AÇÕES</th>
              )}
            </tr>
          </thead>
          <tbody>
            {editedEvolucoes.length > 0 ? (
              editedEvolucoes.map((evolucao, index) => (
                <tr key={evolucao._id || index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 text-sm">
                    {isEditingLocal ? (
                      <input
                        type="text"
                        value={evolucao.nome_paciente || pacienteNome || ''}
                        onChange={(e) => handleInputChange(index, 'nome_paciente', e.target.value)}
                        className="border rounded p-1 w-full text-sm"
                        readOnly={true} // Nome do paciente não deve ser editável
                        title="Nome do paciente obtido automaticamente"
                      />
                    ) : (
                      evolucao.nome_paciente || pacienteNome || ''
                    )}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    {isEditingLocal ? (
                      <input
                        type="date"
                        value={evolucao.data_retorno || ''}
                        onChange={(e) => handleInputChange(index, 'data_retorno', e.target.value)}
                        className="border rounded p-1 w-full text-sm"
                      />
                    ) : (
                      formatDate(evolucao.data_retorno)
                    )}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    {isEditingLocal ? (
                      <input
                        type="text"
                        value={evolucao.delta_t || ''}
                        onChange={(e) => handleInputChange(index, 'delta_t', e.target.value)}
                        className="border rounded p-1 w-full text-sm"
                      />
                    ) : (
                      evolucao.delta_t
                    )}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    {isEditingLocal ? (
                      <input
                        type="number"
                        value={evolucao.peso || ''}
                        onChange={(e) => handleInputChange(index, 'peso', parseFloat(e.target.value))}
                        className="border rounded p-1 w-full text-sm"
                        step="0.1"
                      />
                    ) : (
                      evolucao.peso
                    )}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    {isEditingLocal ? (
                      <input
                        type="number"
                        value={evolucao.delta_peso || ''}
                        onChange={(e) => handleInputChange(index, 'delta_peso', parseFloat(e.target.value))}
                        className="border rounded p-1 w-full text-sm"
                        step="0.1"
                      />
                    ) : (
                      evolucao.delta_peso
                    )}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    {isEditingLocal ? (
                      <input
                        type="text"
                        value={evolucao.exames_alterados || ''}
                        onChange={(e) => handleInputChange(index, 'exames_alterados', e.target.value)}
                        className="border rounded p-1 w-full text-sm"
                      />
                    ) : (
                      evolucao.exames_alterados
                    )}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    {isEditingLocal ? (
                      <input
                        type="text"
                        value={Array.isArray(evolucao.medicacoes) ? evolucao.medicacoes.join(', ') : ''}
                        onChange={(e) => handleInputChange(index, 'medicacoes', e.target.value.split(',').map(item => item.trim()))}
                        className="border rounded p-1 w-full text-sm"
                        placeholder="Separar por vírgulas"
                      />
                    ) : (
                      Array.isArray(evolucao.medicacoes) ? evolucao.medicacoes.join(', ') : ''
                    )}
                  </td>
                  {(isEditingLocal || !isSearchMode) && (
                    <td className="py-2 px-3 text-sm">
                      <div className="flex gap-1">
                        {!isSearchMode && (
                          <button
                            onClick={() => handleDeleteEvolucao(evolucao._id || '', index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title="Deletar evolução"
                            disabled={!evolucao._id}
                          >
                            <span>🗑️</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 px-3 text-center text-gray-500">
                  Nenhuma evolução encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvolucaoCard;
