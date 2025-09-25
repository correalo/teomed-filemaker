export class CreateExamePreopDto {
  paciente_id: string;
  nome_paciente: string;
  data_cadastro?: Date;
  exames?: {
    tem_arquivo?: boolean;
    nome_arquivo?: string;
    data_upload?: Date;
    observacoes?: string;
    arquivo_binario?: string;
    mime_type?: string;
  };
  usg?: {
    tem_arquivo?: boolean;
    nome_arquivo?: string;
    data_upload?: Date;
    observacoes?: string;
    arquivo_binario?: string;
    mime_type?: string;
  };
  eda?: {
    tem_arquivo?: boolean;
    nome_arquivo?: string;
    data_upload?: Date;
    observacoes?: string;
    arquivo_binario?: string;
    mime_type?: string;
  };
  rx?: {
    tem_arquivo?: boolean;
    nome_arquivo?: string;
    data_upload?: Date;
    observacoes?: string;
    arquivo_binario?: string;
    mime_type?: string;
  };
  ecg?: {
    tem_arquivo?: boolean;
    nome_arquivo?: string;
    data_upload?: Date;
    observacoes?: string;
    arquivo_binario?: string;
    mime_type?: string;
  };
  eco?: {
    tem_arquivo?: boolean;
    nome_arquivo?: string;
    data_upload?: Date;
    observacoes?: string;
    arquivo_binario?: string;
    mime_type?: string;
  };
  polissonografia?: {
    tem_arquivo?: boolean;
    nome_arquivo?: string;
    data_upload?: Date;
    observacoes?: string;
    arquivo_binario?: string;
    mime_type?: string;
  };
  outros?: {
    tem_arquivo?: boolean;
    nome_arquivo?: string;
    data_upload?: Date;
    observacoes?: string;
    arquivo_binario?: string;
    mime_type?: string;
  };
  data_cirurgia_prevista?: Date;
  status?: string;
  observacoes_geral?: string;
}
