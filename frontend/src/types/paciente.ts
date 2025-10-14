export interface Endereco {
  completo: string;
  cep: string;
  normalizado: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

export interface Contato {
  telefone: string;
  email: string;
  celular: string;
}

export interface Convenio {
  nome: string;
  carteirinha: string;
  plano: string;
}

export interface Documentos {
  rg: string;
  cpf: string;
}

export interface Cirurgia {
  previa: boolean;
  data: string;
  local: string;
  tratamento: string;
  tipo: string;
  petersenFechado: boolean;
  tamanho_alcas: string;
  data_segunda_cirurgia: string;
  segunda_cirurgia: string;
}

export interface AntecedentesFamiliares {
  dm: boolean;
  has: boolean;
  iam: boolean;
  avc: boolean;
  dislipidemia: boolean;
  neoplasias: boolean;
  outros: boolean;
}

export interface Antecedentes {
  paterno: AntecedentesFamiliares;
  materno: AntecedentesFamiliares;
  tios: AntecedentesFamiliares;
  avos: AntecedentesFamiliares;
}

export interface DadosClinicos {
  peso: number;
  altura: number;
  imc: number;
  alergias: string;
  has: boolean;
  diabetes: boolean;
  dislipidemia: boolean;
  apneia: boolean;
  artropatias: boolean;
  ccc: boolean;
  esteatose: boolean;
  hernia_hiato: boolean;
  refluxo: boolean;
  hernia_incisional: boolean;
  ico: boolean;
  iam: boolean;
  icc: boolean;
  avc: boolean;
  fa: boolean;
  cardiomiopatia_dilatada: boolean;
  asma: boolean;
  incontinencia_urinaria_feminina: boolean;
  infertilidade: boolean;
  ovario_policistico: boolean;
  hemorroidas: boolean;
  varizes_mmii: boolean;
  hipertensao_intracraniana_idiopatica: boolean;
  depressao: boolean;
  estigma_social: boolean;
  tireoide: string;
  outras_doencas: string;
  cirurgia_previa: string;
  cir_previa: string;
  personalidade: string;
  medicacoes_preop: string[];
}

export interface Retorno {
  tipo: string;
  data_prevista: string;
  data_realizada?: string;
  realizado: boolean;
  observacoes?: string;
}

export interface Paciente {
  _id: string;
  nome: string;
  dataNascimento: string;
  idade: number;
  sexo: string;
  profissao: string;
  status: string;
  dataPrimeiraConsulta: string;
  prontuario: number;
  indicacao: string;
  endereco: Endereco;
  contato: Contato;
  convenio: Convenio;
  documentos: Documentos;
  cirurgia: Cirurgia;
  antecedentes: Antecedentes;
  dados_clinicos: DadosClinicos;
  hma_transcricao?: string;
  hma_audio_data?: string; // DEPRECATED
  hma_audio_type?: string; // DEPRECATED
  hma_audio_filename?: string; // DEPRECATED
  hma_audios?: Array<{
    filename: string;
    url: string;
    transcricao: string;
    duracao?: number;
    data_gravacao: string;
  }>;
  hma_resumo_pdf?: string;
  retornos?: Retorno[];
  criadoEm: string;
  atualizadoEm: string;
}
