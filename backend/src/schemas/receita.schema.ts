import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReceitaDocument = Receita & Document;

@Schema()
export class Medicamento {
  @Prop({ required: true })
  nome: string;

  @Prop()
  dosagem: string;

  @Prop()
  posologia: string;

  @Prop()
  duracao: string;
}

@Schema()
export class Medico {
  @Prop()
  nome: string;

  @Prop()
  crm: string;
}

@Schema()
export class MedicamentoMemed {
  @Prop()
  id: string;

  @Prop()
  nome: string;

  @Prop()
  dosagem: string;

  @Prop()
  posologia: string;
}

@Schema()
export class PacienteMemed {
  @Prop()
  id_memed: string;

  @Prop()
  nome: string;
}

@Schema()
export class MedicoMemed {
  @Prop()
  id: string;

  @Prop()
  nome: string;

  @Prop()
  crm: string;
}

@Schema()
export class Memed {
  @Prop()
  prescription_id: string;

  @Prop()
  external_id: string;

  @Prop({ default: 'pendente' })
  status: string;

  @Prop({ default: '' })
  url_pdf: string;

  @Prop()
  data_emissao: Date;

  @Prop({ type: MedicoMemed })
  medico: MedicoMemed;

  @Prop({ type: PacienteMemed })
  paciente: PacienteMemed;

  @Prop([MedicamentoMemed])
  medicamentos: MedicamentoMemed[];

  @Prop({ default: '' })
  observacoes: string;
}

@Schema()
export class Receita {
  @Prop({ type: Types.ObjectId, ref: 'Paciente', required: true })
  paciente_id: Types.ObjectId;

  @Prop({ required: true })
  nome_paciente: string;

  @Prop({ default: Date.now })
  data_emissao: Date;

  @Prop([Medicamento])
  medicamentos: Medicamento[];

  @Prop({ type: Medico })
  medico: Medico;

  @Prop({ type: Memed })
  memed: Memed;
}

export const ReceitaSchema = SchemaFactory.createForClass(Receita);
