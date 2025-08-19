import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receita, ReceitaDocument } from '../schemas/receita.schema';

@Injectable()
export class ReceitasService {
  constructor(
    @InjectModel(Receita.name) private receitaModel: Model<ReceitaDocument>,
  ) {}

  async findByPacienteId(pacienteId: string): Promise<Receita[]> {
    return this.receitaModel.find({ paciente_id: pacienteId }).sort({ data_emissao: -1 }).exec();
  }

  async create(createReceitaDto: any): Promise<Receita> {
    const createdReceita = new this.receitaModel(createReceitaDto);
    return createdReceita.save();
  }

  async update(id: string, updateReceitaDto: any): Promise<Receita> {
    return this.receitaModel.findByIdAndUpdate(id, updateReceitaDto, { new: true }).exec();
  }
}
