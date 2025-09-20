import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Medicacao {
  nome: string;
  dosagem: string;
  posologia: string;
}

export interface Evolucao {
  _id?: string;
  paciente_id: string;
  nome_paciente: string;
  data_retorno: string;
  delta_t: string;
  peso: number;
  delta_peso: number;
  exames_alterados: string;
  medicacoes: Medicacao[];
  observacoes?: string;
  data_criacao?: Date;
  data_atualizacao?: Date;
  isEditing?: boolean;
}

export interface EvolucaoSearchFields {
  data_retorno?: string;
  delta_t?: string;
  peso?: string;
  delta_peso?: string;
  exames_alterados?: string;
  observacoes?: string;
}

export function useEvolucoes(pacienteId: string) {
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvolucoes = async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch(`/api/evolucoes/paciente/${pacienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Não encontrou evoluções para este paciente, o que é normal para novos pacientes
          setEvolucoes([]);
          setLoading(false);
          return;
        }
        
        throw new Error(`Erro ao buscar evoluções: ${response.status}`);
      }
      
      const data = await response.json();
      setEvolucoes(data);
    } catch (err: any) {
      console.error('Erro ao buscar evoluções:', err);
      setError(err.message || 'Erro ao buscar evoluções');
      // Não mostrar toast para erro 404 (evoluções não encontradas)
      if (err.message && !err.message.includes('404')) {
        toast.error(err.message || 'Erro ao buscar evoluções');
      }
    } finally {
      setLoading(false);
    }
  };

  const createEvolucao = async (evolucao: Evolucao) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await fetch('/api/evolucoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evolucao)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar evolução: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Atualizar estado local
      setEvolucoes(prev => [data, ...prev]);
      
      toast.success('Evolução criada com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao criar evolução:', err);
      toast.error(err.message || 'Erro ao criar evolução');
      throw err;
    }
  };

  const updateEvolucao = async (id: string, evolucao: Partial<Evolucao>) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await fetch(`/api/evolucoes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evolucao)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar evolução: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Atualizar estado local
      setEvolucoes(prev => prev.map(e => e._id === id ? { ...e, ...data } : e));
      
      toast.success('Evolução atualizada com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar evolução:', err);
      toast.error(err.message || 'Erro ao atualizar evolução');
      throw err;
    }
  };

  const deleteEvolucao = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await fetch(`/api/evolucoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir evolução: ${response.status}`);
      }
      
      // Atualizar estado local
      setEvolucoes(prev => prev.filter(e => e._id !== id));
      
      toast.success('Evolução excluída com sucesso');
    } catch (err: any) {
      console.error('Erro ao excluir evolução:', err);
      toast.error(err.message || 'Erro ao excluir evolução');
      throw err;
    }
  };

  useEffect(() => {
    fetchEvolucoes();
  }, [pacienteId]);

  return {
    evolucoes,
    loading,
    error,
    fetchEvolucoes,
    createEvolucao,
    updateEvolucao,
    deleteEvolucao
  };
}
