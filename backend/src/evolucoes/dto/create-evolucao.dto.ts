export class CreateEvolucaoDto {
  paciente_id: string;
  nome_paciente?: string;
  data_retorno?: Date;
  delta_t?: string;
  peso?: number;
  delta_peso?: number;
  exames_alterados?: string;
  medicacoes?: string[];
}
