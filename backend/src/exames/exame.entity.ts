import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExameDocument = Exame & Document;

@Schema({ collection: 'exames' })
export class Exame {
  @Prop({ required: true })
  paciente_id: string;

  @Prop()
  nome_paciente: string;

  @Prop({ type: Date, default: Date.now })
  data_criacao: Date;

  @Prop({ type: Date, default: Date.now })
  data_atualizacao: Date;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  laboratoriais: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  usg: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  eda: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  // Renomeado para ECOCARDIOGRAMA na interface
  colono: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  // Renomeado para RX DE TÓRAX na interface
  anatomia_patologica: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  tomografia: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  // Renomeado para POLISSONOGRAFIA na interface
  bioimpedancia: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  outros: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;

  @Prop([{
    nome_original: String,
    nome_arquivo: String,
    tipo: String,
    tamanho: Number,
    data: String, // Armazenar arquivo como binário de 64 bits (Base64)
    data_upload: { type: Date, default: Date.now }
  }])
  outros2: Array<{
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
    data_upload: Date;
  }>;
}

export const ExameSchema = SchemaFactory.createForClass(Exame);
