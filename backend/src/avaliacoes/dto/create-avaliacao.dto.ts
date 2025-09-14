export class CreateAvaliacaoDto {
  paciente_id: string;
  nome_paciente: string;
  cardiologista?: Array<{
    nome_original: string;
    nome_arquivo: string;
    caminho: string;
    tipo: string;
    tamanho: number;
  }>;
  endocrino?: Array<{
    nome_original: string;
    nome_arquivo: string;
    caminho: string;
    tipo: string;
    tamanho: number;
  }>;
  nutricionista?: Array<{
    nome_original: string;
    nome_arquivo: string;
    caminho: string;
    tipo: string;
    tamanho: number;
  }>;
  psicologa?: Array<{
    nome_original: string;
    nome_arquivo: string;
    caminho: string;
    tipo: string;
    tamanho: number;
  }>;
  outros?: Array<{
    nome_original: string;
    nome_arquivo: string;
    caminho: string;
    tipo: string;
    tamanho: number;
  }>;
}
