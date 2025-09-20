import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Medicamento {
  nome: string;
  dosagem: string;
  posologia: string;
}

export interface Receita {
  _id?: string;
  paciente_id: string;
  nome_paciente: string;
  data: string;
  medicamentos: Medicamento[];
  observacoes?: string;
  data_criacao?: Date;
  data_atualizacao?: Date;
}

export function useReceitas(pacienteId: string) {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceitas = async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch(`/api/receitas/paciente/${pacienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Não encontrou receitas para este paciente, o que é normal para novos pacientes
          setReceitas([]);
          setLoading(false);
          return;
        }
        
        throw new Error(`Erro ao buscar receitas: ${response.status}`);
      }
      
      const data = await response.json();
      setReceitas(data);
    } catch (err: any) {
      console.error('Erro ao buscar receitas:', err);
      setError(err.message || 'Erro ao buscar receitas');
      // Não mostrar toast para erro 404 (receitas não encontradas)
      if (err.message && !err.message.includes('404')) {
        toast.error(err.message || 'Erro ao buscar receitas');
      }
    } finally {
      setLoading(false);
    }
  };

  const createReceita = async (receita: Receita) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await fetch('/api/receitas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(receita)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar receita: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Atualizar estado local
      setReceitas(prev => [data, ...prev]);
      
      toast.success('Receita criada com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao criar receita:', err);
      toast.error(err.message || 'Erro ao criar receita');
      throw err;
    }
  };

  const updateReceita = async (id: string, receita: Partial<Receita>) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await fetch(`/api/receitas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(receita)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar receita: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Atualizar estado local
      setReceitas(prev => prev.map(r => r._id === id ? { ...r, ...data } : r));
      
      toast.success('Receita atualizada com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar receita:', err);
      toast.error(err.message || 'Erro ao atualizar receita');
      throw err;
    }
  };

  const deleteReceita = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await fetch(`/api/receitas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir receita: ${response.status}`);
      }
      
      // Atualizar estado local
      setReceitas(prev => prev.filter(r => r._id !== id));
      
      toast.success('Receita excluída com sucesso');
    } catch (err: any) {
      console.error('Erro ao excluir receita:', err);
      toast.error(err.message || 'Erro ao excluir receita');
      throw err;
    }
  };

  useEffect(() => {
    fetchReceitas();
  }, [pacienteId]);

  return {
    receitas,
    loading,
    error,
    fetchReceitas,
    createReceita,
    updateReceita,
    deleteReceita
  };
}
