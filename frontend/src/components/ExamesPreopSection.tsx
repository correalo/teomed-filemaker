import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ExamePreopUploader from './ExamePreopUploader';

interface ExamesPreopSectionProps {
  pacienteId: string;
  nomePaciente: string;
}

interface ExamePreop {
  _id: string;
  paciente_id: string;
  nome_paciente: string;
  data_cadastro: string;
  status: string;
  observacoes_geral: string;
  exames?: { tem_arquivo: boolean; nome_arquivo: string };
  usg?: { tem_arquivo: boolean; nome_arquivo: string };
  eda?: { tem_arquivo: boolean; nome_arquivo: string };
  rx?: { tem_arquivo: boolean; nome_arquivo: string };
  ecg?: { tem_arquivo: boolean; nome_arquivo: string };
  eco?: { tem_arquivo: boolean; nome_arquivo: string };
  polissonografia?: { tem_arquivo: boolean; nome_arquivo: string };
  outros?: { tem_arquivo: boolean; nome_arquivo: string };
}

const ExamesPreopSection: React.FC<ExamesPreopSectionProps> = ({ pacienteId, nomePaciente }) => {
  const [examePreop, setExamePreop] = useState<ExamePreop | null>(null);
  const [loading, setLoading] = useState(true);
  const [observacoesGeral, setObservacoesGeral] = useState('');
  const [status, setStatus] = useState('pendente');

  const loadExamePreop = async () => {
    try {
      setLoading(true);
      
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você não está autenticado');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3004/exames-preop/paciente/${pacienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        // Exame não encontrado, mas não é um erro
        setExamePreop(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar exame pré-operatório');
      }

      const data = await response.json();
      setExamePreop(data);
      
      if (data) {
        setObservacoesGeral(data.observacoes_geral || '');
        setStatus(data.status || 'pendente');
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamePreop();
  }, [pacienteId]);

  const handleSaveInfo = async () => {
    try {
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você não está autenticado');
        return;
      }

      const data = {
        observacoes_geral: observacoesGeral,
        status: status
      };

      let url = `http://localhost:3004/exames-preop`;
      let method = 'POST';
      
      if (examePreop) {
        url = `http://localhost:3004/exames-preop/${examePreop._id}`;
        method = 'PATCH';
      } else {
        // Se não existe, precisamos criar com os dados do paciente
        data['paciente_id'] = pacienteId;
        data['nome_paciente'] = nomePaciente;
        data['data_cadastro'] = new Date().toISOString();
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar informações');
      }

      toast.success('Informações salvas com sucesso!');
      loadExamePreop();
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  if (loading) {
    return <div className="p-4">Carregando exames pré-operatórios...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Exames Pré-Operatórios</h2>
      
      <div className="mb-6 p-4 border rounded">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Observações Gerais</label>
          <textarea
            value={observacoesGeral}
            onChange={(e) => setObservacoesGeral(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
        
        <button
          onClick={handleSaveInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Salvar Informações
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExamePreopUploader
          pacienteId={pacienteId}
          fieldName="exames"
          label="Exames Laboratoriais"
          onUploadSuccess={loadExamePreop}
        />
        
        <ExamePreopUploader
          pacienteId={pacienteId}
          fieldName="usg"
          label="Ultrassonografia"
          onUploadSuccess={loadExamePreop}
        />
        
        <ExamePreopUploader
          pacienteId={pacienteId}
          fieldName="eda"
          label="Endoscopia Digestiva Alta"
          onUploadSuccess={loadExamePreop}
        />
        
        <ExamePreopUploader
          pacienteId={pacienteId}
          fieldName="rx"
          label="Raio-X de Tórax"
          onUploadSuccess={loadExamePreop}
        />
        
        <ExamePreopUploader
          pacienteId={pacienteId}
          fieldName="ecg"
          label="Eletrocardiograma"
          onUploadSuccess={loadExamePreop}
        />
        
        <ExamePreopUploader
          pacienteId={pacienteId}
          fieldName="eco"
          label="Ecocardiograma"
          onUploadSuccess={loadExamePreop}
        />
        
        <ExamePreopUploader
          pacienteId={pacienteId}
          fieldName="polissonografia"
          label="Polissonografia"
          onUploadSuccess={loadExamePreop}
        />
        
        <ExamePreopUploader
          pacienteId={pacienteId}
          fieldName="outros"
          label="Outros Exames"
          onUploadSuccess={loadExamePreop}
        />
      </div>
      
      {examePreop && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Arquivos Disponíveis</h3>
          <ul className="list-disc pl-5">
            {examePreop.exames?.tem_arquivo && (
              <li>Exames Laboratoriais: {examePreop.exames.nome_arquivo}</li>
            )}
            {examePreop.usg?.tem_arquivo && (
              <li>Ultrassonografia: {examePreop.usg.nome_arquivo}</li>
            )}
            {examePreop.eda?.tem_arquivo && (
              <li>Endoscopia Digestiva Alta: {examePreop.eda.nome_arquivo}</li>
            )}
            {examePreop.rx?.tem_arquivo && (
              <li>Raio-X de Tórax: {examePreop.rx.nome_arquivo}</li>
            )}
            {examePreop.ecg?.tem_arquivo && (
              <li>Eletrocardiograma: {examePreop.ecg.nome_arquivo}</li>
            )}
            {examePreop.eco?.tem_arquivo && (
              <li>Ecocardiograma: {examePreop.eco.nome_arquivo}</li>
            )}
            {examePreop.polissonografia?.tem_arquivo && (
              <li>Polissonografia: {examePreop.polissonografia.nome_arquivo}</li>
            )}
            {examePreop.outros?.tem_arquivo && (
              <li>Outros Exames: {examePreop.outros.nome_arquivo}</li>
            )}
            {!examePreop.exames?.tem_arquivo && 
              !examePreop.usg?.tem_arquivo && 
              !examePreop.eda?.tem_arquivo && 
              !examePreop.rx?.tem_arquivo && 
              !examePreop.ecg?.tem_arquivo && 
              !examePreop.eco?.tem_arquivo && 
              !examePreop.polissonografia?.tem_arquivo && 
              !examePreop.outros?.tem_arquivo && (
                <li>Nenhum arquivo disponível</li>
              )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExamesPreopSection;
