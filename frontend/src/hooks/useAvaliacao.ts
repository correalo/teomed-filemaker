import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface FileInfo {
  nome_original: string;
  nome_arquivo: string;
  tipo: string;
  tamanho: number;
  data_upload?: string;
  // Para arquivos locais
  name?: string;
  size?: number;
  type?: string;
}

interface AvaliacaoData {
  _id?: string;
  paciente_id: string;
  nome_paciente?: string;
  data_criacao?: string;
  data_atualizacao?: string;
  cardiologista?: FileInfo[];
  endocrino?: FileInfo[];
  nutricionista?: FileInfo[];
  psicologa?: FileInfo[];
  outros?: FileInfo[];
  outros2?: FileInfo[];
}

export function useAvaliacao(pacienteId: string) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvaliacao = async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch(`/api/avaliacoes/paciente/${pacienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Não encontrou avaliação para este paciente, o que é normal para novos pacientes
          setAvaliacao(null);
          setLoading(false);
          return;
        }
        
        throw new Error(`Erro ao buscar avaliação: ${response.status}`);
      }
      
      const data = await response.json();
      setAvaliacao(data);
    } catch (err: any) {
      console.error('Erro ao buscar avaliação:', err);
      setError(err.message || 'Erro ao buscar avaliação');
      // Não mostrar toast para erro 404 (avaliação não encontrada)
      if (err.message && !err.message.includes('404')) {
        toast.error(err.message || 'Erro ao buscar avaliação');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliacao();
  }, [pacienteId]);

  return {
    avaliacao,
    loading,
    error,
    refetchAvaliacao: fetchAvaliacao
  };
}

export function useAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvaliacoes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch('/api/avaliacoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar avaliações: ${response.status}`);
      }
      
      const data = await response.json();
      setAvaliacoes(data);
    } catch (err: any) {
      console.error('Erro ao buscar avaliações:', err);
      setError(err.message || 'Erro ao buscar avaliações');
      toast.error(err.message || 'Erro ao buscar avaliações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliacoes();
  }, []);

  return {
    avaliacoes,
    loading,
    error,
    refetchAvaliacoes: fetchAvaliacoes
  };
}
