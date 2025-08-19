import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExamePreop, ExamePreopDocument } from '../schemas/exame-preop.schema';

@Injectable()
export class ExamesPreopService {
  constructor(
    @InjectModel(ExamePreop.name) private examePreopModel: Model<ExamePreopDocument>,
  ) {}

  async findByPacienteId(pacienteId: string): Promise<ExamePreop[]> {
    return this.examePreopModel.find({ paciente_id: pacienteId }).exec();
  }

  async create(createExamePreopDto: any): Promise<ExamePreop> {
    const createdExamePreop = new this.examePreopModel(createExamePreopDto);
    return createdExamePreop.save();
  }

  async update(id: string, updateExamePreopDto: any): Promise<ExamePreop> {
    return this.examePreopModel.findByIdAndUpdate(id, updateExamePreopDto, { new: true }).exec();
  }
}
