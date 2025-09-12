export interface Evolucao {
  _id?: string;
  paciente_id: string;
  nome_paciente: string;
  data_retorno: string;
  delta_t: string;
  peso: number;
  delta_peso: number;
  exames_alterados: string;
  medicacoes: string[];
  exames_posop?: Record<string, any>;
  _modified?: boolean;
  _editing?: boolean;
}

export interface EvolucaoSearchFields {
  nome_paciente?: string;
  data_retorno?: string;
  delta_t?: string;
  peso?: string;
  delta_peso?: string;
  exames_alterados?: string;
  medicacoes?: string;
}
