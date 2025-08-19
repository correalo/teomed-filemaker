import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamePreopDocument = ExamePreop & Document;

@Schema()
export class ExameArquivo {
  @Prop({ default: false })
  tem_arquivo: boolean;

  @Prop({ default: '' })
  nome_arquivo: string;

  @Prop()
  data_upload: Date;

  @Prop({ default: '' })
  observacoes: string;

  @Prop()
  arquivo_binario: Buffer;

  @Prop({ default: '' })
  mime_type: string;
}

@Schema()
export class ExamesDetalhes {
  @Prop({ type: ExameArquivo })
  laboratoriais: ExameArquivo;

  @Prop({ type: ExameArquivo })
  usg: ExameArquivo;

  @Prop({ type: ExameArquivo })
  eda: ExameArquivo;

  @Prop({ type: ExameArquivo })
  rx: ExameArquivo;

  @Prop({ type: ExameArquivo })
  ecg: ExameArquivo;

  @Prop({ type: ExameArquivo })
  eco: ExameArquivo;

  @Prop({ type: ExameArquivo })
  polissonografia: ExameArquivo;

  @Prop({ type: ExameArquivo })
  outros: ExameArquivo;
}

@Schema({ timestamps: { createdAt: 'data_cadastro' } })
export class ExamePreop {
  @Prop({ type: Types.ObjectId, ref: 'Paciente', required: true })
  paciente_id: Types.ObjectId;

  @Prop({ required: true })
  nome_paciente: string;

  @Prop({ type: ExamesDetalhes })
  exames: ExamesDetalhes;

  @Prop()
  data_cirurgia_prevista: Date;

  @Prop({ default: 'pendente' })
  status: string;

  @Prop({ default: '' })
  observacoes_gerais: string;
}

export const ExamePreopSchema = SchemaFactory.createForClass(ExamePreop);
