import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

interface ExamePreopUploaderProps {
  pacienteId: string;
  fieldName: string;
  label: string;
  onUploadSuccess?: () => void;
}

const ExamePreopUploader: React.FC<ExamePreopUploaderProps> = ({
  pacienteId,
  fieldName,
  label,
  onUploadSuccess
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [observacoes, setObservacoes] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    console.log('Drop event detected! Files:', e.dataTransfer.files);
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      // Atualizar o input de arquivo com o arquivo arrastado
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        setFileName(files[0].name);
        toast.info(`Arquivo ${files[0].name} selecionado.`);
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      toast.error('Selecione um arquivo para upload');
      return;
    }

    const file = fileInputRef.current.files[0];
    
    // Validar tamanho do arquivo (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('O arquivo é muito grande. O tamanho máximo é 50MB.');
      return;
    }

    setIsUploading(true);
    
    try {
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você não está autenticado');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      
      if (observacoes) {
        formData.append('observacoes', observacoes);
      }

      const response = await fetch(`http://localhost:3004/exames-preop/upload/${pacienteId}/${fieldName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer upload do arquivo');
      }

      toast.success('Arquivo enviado com sucesso!');
      setFileName(null);
      setObservacoes('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Erro ao fazer upload de arquivo:', error);
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você não está autenticado');
        return;
      }

      console.log(`Tentando baixar arquivo para paciente: ${pacienteId}, campo: ${fieldName}`);

      const response = await fetch(`http://localhost:3004/exames-preop/file/${pacienteId}/${fieldName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.info('Nenhum arquivo encontrado para este campo');
          console.warn(`Arquivo não encontrado para paciente: ${pacienteId}, campo: ${fieldName}`);
          return;
        }
        
        try {
          const errorData = await response.json();
          console.error('Erro detalhado:', errorData);
          throw new Error(errorData.message || 'Erro ao baixar o arquivo');
        } catch (jsonError) {
          // Se não conseguir obter JSON, mostra o status e statusText
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }

      // Criar um blob a partir da resposta
      const blob = await response.blob();
      
      // Criar uma URL para o blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar um link para download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Tentar obter o nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Tem certeza que deseja remover este arquivo?')) {
      return;
    }

    try {
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você não está autenticado');
        return;
      }

      console.log(`Tentando remover arquivo para paciente: ${pacienteId}, campo: ${fieldName}`);

      const response = await fetch(`http://localhost:3004/exames-preop/file/${pacienteId}/${fieldName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Erro detalhado na remoção:', errorData);
          throw new Error(errorData.message || 'Erro ao remover o arquivo');
        } catch (jsonError) {
          // Se não conseguir obter JSON, mostra o status e statusText
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }

      toast.success('Arquivo removido com sucesso!');
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="mb-4 p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Arquivo</label>
        <div 
          className={`border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer mb-2`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Clique para enviar</span> ou arraste arquivos
            </div>
            <div className="text-xs text-gray-500">
              PDF, HEIC, JPEG, PNG (máx. 50MB)
            </div>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        
        {fileName && (
          <div className="mt-2 p-2 bg-gray-50 border rounded flex items-center justify-between">
            <span className="text-sm truncate">{fileName}</span>
            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                  setFileName(null);
                }
              }}
              className="ml-2 text-red-500 hover:text-red-700"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={2}
          disabled={isUploading}
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={isUploading || !fileName}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
        
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Baixar
        </button>
        
        <button
          onClick={handleRemove}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Remover
        </button>
      </div>
    </div>
  );
};

export default ExamePreopUploader;
