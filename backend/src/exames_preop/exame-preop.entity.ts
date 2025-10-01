import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamePreopDocument = ExamePreop & Document;

@Schema({ collection: 'exames_preop' })
export class ExamePreop {
  @Prop({ required: true })
  paciente_id: string;

  @Prop()
  nome_paciente: string;

  @Prop({ type: Date, default: Date.now })
  data_cadastro: Date;

  @Prop({ type: Date, default: Date.now })
  data_atualizacao: Date;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String,
    data_upload: { type: Date, default: Date.now }
  }])
  exames: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String,
    data_upload: { type: Date, default: Date.now }
  }])
  usg: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String,
    data_upload: { type: Date, default: Date.now }
  }])
  eda: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String,
    data_upload: { type: Date, default: Date.now }
  }])
  rx: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String,
    data_upload: { type: Date, default: Date.now }
  }])
  ecg: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String,
    data_upload: { type: Date, default: Date.now }
  }])
  eco: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String,
    data_upload: { type: Date, default: Date.now }
  }])
  polissonografia: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String,
    data_upload: { type: Date, default: Date.now }
  }])
  outros: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string;
    data_upload: Date;
  }>;

  @Prop({ type: Date })
  data_cirurgia_prevista: Date;

  @Prop({ default: 'pendente' })
  status: string;

  @Prop({ default: '' })
  observacoes_geral: string;
}

export const ExamePreopSchema = SchemaFactory.createForClass(ExamePreop);
