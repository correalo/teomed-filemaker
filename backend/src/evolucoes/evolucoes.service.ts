import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evolucao, EvolucaoDocument } from '../schemas/evolucao.schema';

@Injectable()
export class EvolucoesService {
  constructor(
    @InjectModel(Evolucao.name) private evolucaoModel: Model<EvolucaoDocument>,
  ) {}

  async findByPacienteId(pacienteId: string): Promise<Evolucao[]> {
    return this.evolucaoModel.find({ paciente_id: pacienteId }).sort({ data_retorno: -1 }).exec();
  }

  async create(createEvolucaoDto: any): Promise<Evolucao> {
    const createdEvolucao = new this.evolucaoModel(createEvolucaoDto);
    return createdEvolucao.save();
  }

  async update(id: string, updateEvolucaoDto: any): Promise<Evolucao> {
    return this.evolucaoModel.findByIdAndUpdate(id, updateEvolucaoDto, { new: true }).exec();
  }
}
