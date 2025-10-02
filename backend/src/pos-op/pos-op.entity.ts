import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PosOpDocument = PosOp & Document;

@Schema({ collection: 'pos_op' })
export class PosOp {
  @Prop({ required: true })
  paciente_id: string;

  @Prop({ required: true })
  evolucao_id: string;

  @Prop()
  nome_paciente: string;

  @Prop({ type: Date, default: Date.now })
  data_cadastro: Date;

  @Prop({ type: Date, default: Date.now })
  data_atualizacao: Date;

  @Prop({ type: Date })
  data_pos_op: Date;

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

  @Prop({ type: String, default: '' })
  conduta_tratamentos: string;
}

export const PosOpSchema = SchemaFactory.createForClass(PosOp);
