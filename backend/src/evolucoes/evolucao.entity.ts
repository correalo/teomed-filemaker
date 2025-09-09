import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EvolucaoDocument = Evolucao & Document;

@Schema({ collection: 'pacientes_db.evolucoes' })
export class Evolucao {
  @Prop({ required: true })
  paciente_id: string;

  @Prop()
  nome_paciente: string;

  @Prop()
  data_retorno: Date;

  @Prop()
  delta_t: string;

  @Prop()
  peso: number;

  @Prop()
  delta_peso: number;

  @Prop()
  exames_alterados: string;

  @Prop([String])
  medicacoes: string[];
}

export const EvolucaoSchema = SchemaFactory.createForClass(Evolucao);
