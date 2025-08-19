import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avaliacao, AvaliacaoDocument } from '../schemas/avaliacao.schema';

@Injectable()
export class AvaliacoesService {
  constructor(
    @InjectModel(Avaliacao.name) private avaliacaoModel: Model<AvaliacaoDocument>,
  ) {}

  async findByPacienteId(pacienteId: string): Promise<Avaliacao[]> {
    return this.avaliacaoModel.find({ paciente_id: pacienteId }).exec();
  }

  async create(createAvaliacaoDto: any): Promise<Avaliacao> {
    const createdAvaliacao = new this.avaliacaoModel(createAvaliacaoDto);
    return createdAvaliacao.save();
  }

  async update(id: string, updateAvaliacaoDto: any): Promise<Avaliacao> {
    return this.avaliacaoModel.findByIdAndUpdate(id, updateAvaliacaoDto, { new: true }).exec();
  }
}
