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

interface ExameData {
  _id?: string;
  paciente_id: string;
  nome_paciente?: string;
  data_criacao?: string;
  data_atualizacao?: string;
  laboratoriais?: FileInfo[];
  usg?: FileInfo[];
  eda?: FileInfo[];
  colono?: FileInfo[]; // Ecocardiograma
  anatomia_patologica?: FileInfo[]; // RX de Tórax
  tomografia?: FileInfo[];
  bioimpedancia?: FileInfo[]; // Polissonografia
  outros?: FileInfo[];
  outros2?: FileInfo[];
}

export function useExame(pacienteId: string) {
  const [exame, setExame] = useState<ExameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExame = async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch(`/api/exames/paciente/${pacienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Não encontrou exame para este paciente, o que é normal para novos pacientes
          setExame(null);
          setLoading(false);
          return;
        }
        
        throw new Error(`Erro ao buscar exame: ${response.status}`);
      }
      
      const data = await response.json();
      setExame(data);
    } catch (err: any) {
      console.error('Erro ao buscar exame:', err);
      setError(err.message || 'Erro ao buscar exame');
      // Não mostrar toast para erro 404 (exame não encontrado)
      if (err.message && !err.message.includes('404')) {
        toast.error(err.message || 'Erro ao buscar exame');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExame();
  }, [pacienteId]);

  return {
    exame,
    loading,
    error,
    refetchExame: fetchExame
  };
}

export function useExames() {
  const [exames, setExames] = useState<ExameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExames = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch('/api/exames', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar exames: ${response.status}`);
      }
      
      const data = await response.json();
      setExames(data);
    } catch (err: any) {
      console.error('Erro ao buscar exames:', err);
      setError(err.message || 'Erro ao buscar exames');
      toast.error(err.message || 'Erro ao buscar exames');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExames();
  }, []);

  return {
    exames,
    loading,
    error,
    refetchExames: fetchExames
  };
}
