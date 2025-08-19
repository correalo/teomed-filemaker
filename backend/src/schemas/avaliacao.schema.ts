import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AvaliacaoDocument = Avaliacao & Document;

@Schema()
export class AvaliacaoEspecialista {
  @Prop({ default: false })
  tem_arquivo: boolean;

  @Prop({ default: '' })
  nome_arquivo: string;

  @Prop()
  data_upload: Date;

  @Prop()
  data_avaliacao: Date;

  @Prop({ default: '' })
  observacoes: string;

  @Prop({ default: '' })
  profissional: string;

  @Prop({ default: '' })
  registro: string;

  @Prop()
  arquivo_binario: Buffer;

  @Prop({ default: '' })
  mime_type: string;
}

@Schema()
export class AvaliacaoOutros extends AvaliacaoEspecialista {
  @Prop({ default: '' })
  especialidade: string;
}

@Schema()
export class AvaliacoesDetalhes {
  @Prop({ type: AvaliacaoEspecialista })
  cardiologista: AvaliacaoEspecialista;

  @Prop({ type: AvaliacaoEspecialista })
  endocrinologista: AvaliacaoEspecialista;

  @Prop({ type: AvaliacaoEspecialista })
  nutricionista: AvaliacaoEspecialista;

  @Prop({ type: AvaliacaoEspecialista })
  psicologia: AvaliacaoEspecialista;

  @Prop({ type: AvaliacaoOutros })
  outros: AvaliacaoOutros;
}

@Schema({ timestamps: { createdAt: 'data_cadastro' } })
export class Avaliacao {
  @Prop({ type: Types.ObjectId, ref: 'Paciente', required: true })
  paciente_id: Types.ObjectId;

  @Prop({ required: true })
  nome_paciente: string;

  @Prop({ type: AvaliacoesDetalhes })
  avaliacoes: AvaliacoesDetalhes;

  @Prop({ default: 'pendente' })
  status: string;

  @Prop({ default: '' })
  observacoes_gerais: string;
}

export const AvaliacaoSchema = SchemaFactory.createForClass(Avaliacao);
