import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EvolucaoDocument = Evolucao & Document;

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
export class ExamesPosOp {
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

@Schema()
export class Evolucao {
  @Prop({ type: Types.ObjectId, ref: 'Paciente', required: true })
  paciente_id: Types.ObjectId;

  @Prop({ required: true })
  nome_paciente: string;

  @Prop()
  delta_t: string;

  @Prop()
  peso: number;

  @Prop()
  delta_peso: number;

  @Prop({ default: '' })
  exames_alterados: string;

  @Prop([String])
  medicacoes: string[];

  @Prop()
  data_retorno: string;

  @Prop({ type: ExamesPosOp })
  exames_posop: ExamesPosOp;
}

export const EvolucaoSchema = SchemaFactory.createForClass(Evolucao);
