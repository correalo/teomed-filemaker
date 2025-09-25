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

  @Prop({
    type: {
      tem_arquivo: Boolean,
      nome_arquivo: String,
      data_upload: Date,
      observacoes: String,
      arquivo_binario: String, // Armazenar arquivo como binário de 64 bits (Base64)
      mime_type: String
    }
  })
  exames: {
    tem_arquivo: boolean;
    nome_arquivo: string;
    data_upload: Date;
    observacoes: string;
    arquivo_binario: string; // Base64
    mime_type: string;
  };

  @Prop({
    type: {
      tem_arquivo: Boolean,
      nome_arquivo: String,
      data_upload: Date,
      observacoes: String,
      arquivo_binario: String, // Armazenar arquivo como binário de 64 bits (Base64)
      mime_type: String
    }
  })
  usg: {
    tem_arquivo: boolean;
    nome_arquivo: string;
    data_upload: Date;
    observacoes: string;
    arquivo_binario: string; // Base64
    mime_type: string;
  };

  @Prop({
    type: {
      tem_arquivo: Boolean,
      nome_arquivo: String,
      data_upload: Date,
      observacoes: String,
      arquivo_binario: String, // Armazenar arquivo como binário de 64 bits (Base64)
      mime_type: String
    }
  })
  eda: {
    tem_arquivo: boolean;
    nome_arquivo: string;
    data_upload: Date;
    observacoes: string;
    arquivo_binario: string; // Base64
    mime_type: string;
  };

  @Prop({
    type: {
      tem_arquivo: Boolean,
      nome_arquivo: String,
      data_upload: Date,
      observacoes: String,
      arquivo_binario: String, // Armazenar arquivo como binário de 64 bits (Base64)
      mime_type: String
    }
  })
  rx: {
    tem_arquivo: boolean;
    nome_arquivo: string;
    data_upload: Date;
    observacoes: string;
    arquivo_binario: string; // Base64
    mime_type: string;
  };

  @Prop({
    type: {
      tem_arquivo: Boolean,
      nome_arquivo: String,
      data_upload: Date,
      observacoes: String,
      arquivo_binario: String, // Armazenar arquivo como binário de 64 bits (Base64)
      mime_type: String
    }
  })
  ecg: {
    tem_arquivo: boolean;
    nome_arquivo: string;
    data_upload: Date;
    observacoes: string;
    arquivo_binario: string; // Base64
    mime_type: string;
  };

  @Prop({
    type: {
      tem_arquivo: Boolean,
      nome_arquivo: String,
      data_upload: Date,
      observacoes: String,
      arquivo_binario: String, // Armazenar arquivo como binário de 64 bits (Base64)
      mime_type: String
    }
  })
  eco: {
    tem_arquivo: boolean;
    nome_arquivo: string;
    data_upload: Date;
    observacoes: string;
    arquivo_binario: string; // Base64
    mime_type: string;
  };

  @Prop({
    type: {
      tem_arquivo: Boolean,
      nome_arquivo: String,
      data_upload: Date,
      observacoes: String,
      arquivo_binario: String, // Armazenar arquivo como binário de 64 bits (Base64)
      mime_type: String
    }
  })
  polissonografia: {
    tem_arquivo: boolean;
    nome_arquivo: string;
    data_upload: Date;
    observacoes: string;
    arquivo_binario: string; // Base64
    mime_type: string;
  };

  @Prop({
    type: {
      tem_arquivo: Boolean,
      nome_arquivo: String,
      data_upload: Date,
      observacoes: String,
      arquivo_binario: String, // Armazenar arquivo como binário de 64 bits (Base64)
      mime_type: String
    }
  })
  outros: {
    tem_arquivo: boolean;
    nome_arquivo: string;
    data_upload: Date;
    observacoes: string;
    arquivo_binario: string; // Base64
    mime_type: string;
  };

  @Prop({ type: Date })
  data_cirurgia_prevista: Date;

  @Prop({ default: 'pendente' })
  status: string;

  @Prop({ default: '' })
  observacoes_geral: string;
}

export const ExamePreopSchema = SchemaFactory.createForClass(ExamePreop);
