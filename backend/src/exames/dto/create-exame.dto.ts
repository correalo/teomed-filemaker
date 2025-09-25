export class CreateExameDto {
  paciente_id: string;
  nome_paciente?: string;
  laboratoriais?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  usg?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  eda?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  // Renomeado para ECOCARDIOGRAMA na interface
  colono?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  // Renomeado para RX DE TÓRAX na interface
  anatomia_patologica?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  // Renomeado para ELETROCARDIOGRAMA na interface
  tomografia?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  // Renomeado para POLISSONOGRAFIA na interface
  bioimpedancia?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  // Renomeado para OUTROS EXAMES PRÉ-OP na interface
  outros?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  // Não mais usado na interface - mantido para compatibilidade com dados existentes
  outros2?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
}
