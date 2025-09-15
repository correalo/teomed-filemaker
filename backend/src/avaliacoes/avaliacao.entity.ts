import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvaliacaoDocument = Avaliacao & Document;

@Schema({ collection: 'avaliacoes' })
export class Avaliacao {
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
  cardiologista: Array<{
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
  endocrino: Array<{
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
  nutricionista: Array<{
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
  psicologa: Array<{
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
}

export const AvaliacaoSchema = SchemaFactory.createForClass(Avaliacao);
