import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PacienteDocument = Paciente & Document;

@Schema()
export class Endereco {
  @Prop()
  completo: string;

  @Prop()
  cep: string;

  @Prop({
    type: {
      logradouro: String,
      numero: String,
      complemento: String,
      bairro: String,
      cidade: String,
      estado: String,
    }
  })
  normalizado: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

@Schema()
export class Contato {
  @Prop()
  telefone: string;

  @Prop()
  email: string;

  @Prop()
  celular: string;
}

@Schema()
export class Convenio {
  @Prop()
  nome: string;

  @Prop()
  carteirinha: string;

  @Prop()
  plano: string;
}

@Schema()
export class Documentos {
  @Prop()
  rg: string;

  @Prop()
  cpf: string;
}

@Schema()
export class Cirurgia {
  @Prop()
  previa: boolean;

  @Prop()
  data: string;

  @Prop()
  local: string;

  @Prop()
  tratamento: string;

  @Prop()
  tipo: string;

  @Prop()
  petersenFechado: boolean;

  @Prop()
  tamanho_alcas: string;

  @Prop()
  data_segunda_cirurgia: string;

  @Prop()
  segunda_cirurgia: string;
}

@Schema()
export class AntecedentesFamiliares {
  @Prop()
  dm: boolean;

  @Prop()
  has: boolean;

  @Prop()
  iam: boolean;

  @Prop()
  avc: boolean;

  @Prop()
  dislipidemia: boolean;

  @Prop()
  neoplasias: boolean;

  @Prop()
  outros: boolean;
}

@Schema()
export class Antecedentes {
  @Prop({ type: AntecedentesFamiliares })
  paterno: AntecedentesFamiliares;

  @Prop({ type: AntecedentesFamiliares })
  materno: AntecedentesFamiliares;

  @Prop({ type: AntecedentesFamiliares })
  tios: AntecedentesFamiliares;

  @Prop({ type: AntecedentesFamiliares })
  avos: AntecedentesFamiliares;
}

@Schema()
export class DadosClinicos {
  @Prop()
  peso: number;

  @Prop()
  altura: number;

  @Prop()
  imc: number;

  @Prop()
  alergias: string;

  @Prop()
  has: boolean;

  @Prop()
  diabetes: boolean;

  @Prop()
  dislipidemia: boolean;

  @Prop()
  apneia: boolean;

  @Prop()
  artropatias: boolean;

  @Prop()
  ccc: boolean;

  @Prop()
  esteatose: boolean;

  @Prop()
  hernia_hiato: boolean;

  @Prop()
  refluxo: boolean;

  @Prop()
  hernia_incisional: boolean;

  @Prop()
  ico: boolean;

  @Prop()
  iam: boolean;

  @Prop()
  icc: boolean;

  @Prop()
  avc: boolean;

  @Prop()
  fa: boolean;

  @Prop()
  cardiomiopatia_dilatada: boolean;

  @Prop()
  asma: boolean;

  @Prop()
  incontinencia_urinaria_feminina: boolean;

  @Prop()
  infertilidade: boolean;

  @Prop()
  ovario_policistico: boolean;

  @Prop()
  hemorroidas: boolean;

  @Prop()
  varizes_mmii: boolean;

  @Prop()
  hipertensao_intracraniana_idiopatica: boolean;

  @Prop()
  depressao: boolean;

  @Prop()
  estigma_social: boolean;

  @Prop()
  tireoide: string;

  @Prop()
  outras_doencas: string;

  @Prop()
  cirurgia_previa: string;

  @Prop()
  cir_previa: string;

  @Prop()
  personalidade: string;

  @Prop([String])
  medicacoes_preop: string[];
}

@Schema()
export class Retorno {
  @Prop()
  tipo: string; // '7 DIAS', '30 DIAS', 'EXAMES 3 MESES', etc.

  @Prop()
  data_prevista: Date;

  @Prop()
  data_realizada: Date;

  @Prop({ default: false })
  realizado: boolean;

  @Prop()
  observacoes: string;
}

@Schema({ timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } })
export class Paciente {
  @Prop({ required: true })
  nome: string;

  @Prop()
  dataNascimento: string;

  @Prop()
  idade: number;

  @Prop()
  sexo: string;

  @Prop()
  profissao: string;

  @Prop()
  status: string;

  @Prop()
  dataPrimeiraConsulta: string;

  @Prop({ unique: true })
  prontuario: number;

  @Prop()
  indicacao: string;

  @Prop({ type: Endereco })
  endereco: Endereco;

  @Prop({ type: Contato })
  contato: Contato;

  @Prop({ type: Convenio })
  convenio: Convenio;

  @Prop({ type: Documentos })
  documentos: Documentos;

  @Prop({ type: Cirurgia })
  cirurgia: Cirurgia;

  @Prop({ type: Antecedentes })
  antecedentes: Antecedentes;

  @Prop({ type: DadosClinicos })
  dados_clinicos: DadosClinicos;

  @Prop()
  hma_transcricao: string;

  @Prop()
  hma_audio_data: string; // Base64 do arquivo de áudio (DEPRECATED - usar hma_audios)

  @Prop()
  hma_audio_type: string; // Tipo MIME (DEPRECATED)

  @Prop()
  hma_audio_filename: string; // Nome original (DEPRECATED)

  @Prop({
    type: [{
      filename: String,
      url: String,
      transcricao: String,
      duracao: Number,
      data_gravacao: Date,
    }],
    default: []
  })
  hma_audios: Array<{
    filename: string;
    url: string;
    transcricao: string;
    duracao?: number;
    data_gravacao: Date;
  }>;

  @Prop()
  hma_resumo_pdf: string;

  @Prop({
    type: {
      tipo: String,
      justificativa: String,
      data_analise: Date,
    }
  })
  analise_personalidade: {
    tipo: string;
    justificativa: string;
    data_analise: Date;
  };

  @Prop({
    type: [{
      tipo: String,
      data_prevista: Date,
      data_realizada: Date,
      realizado: { type: Boolean, default: false },
      observacoes: String,
    }],
    default: []
  })
  retornos: Array<{
    tipo: string;
    data_prevista: Date;
    data_realizada?: Date;
    realizado: boolean;
    observacoes?: string;
  }>;
}

export const PacienteSchema = SchemaFactory.createForClass(Paciente);

// Middleware para calcular IMC automaticamente
PacienteSchema.pre('save', function(next) {
  if (this.dados_clinicos && this.dados_clinicos.peso && this.dados_clinicos.altura) {
    const peso = this.dados_clinicos.peso;
    const altura = this.dados_clinicos.altura;
    this.dados_clinicos.imc = parseFloat((peso / (altura * altura)).toFixed(2));
  }
  next();
});

PacienteSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update && update.dados_clinicos) {
    const peso = update.dados_clinicos.peso;
    const altura = update.dados_clinicos.altura;
    
    if (peso && altura) {
      update.dados_clinicos.imc = parseFloat((peso / (altura * altura)).toFixed(2));
    }
  }
  next();
});
