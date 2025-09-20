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
  outros?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
  outros2?: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload?: Date;
  }>;
}
