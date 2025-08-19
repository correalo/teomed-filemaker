import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Paciente, PacienteDocument } from '../schemas/paciente.schema';

@Injectable()
export class PacientesService {
  constructor(
    @InjectModel(Paciente.name) private pacienteModel: Model<PacienteDocument>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<{ pacientes: Paciente[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [pacientes, total] = await Promise.all([
      this.pacienteModel.find().skip(skip).limit(limit).exec(),
      this.pacienteModel.countDocuments().exec(),
    ]);
    
    return {
      pacientes,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Paciente> {
    return this.pacienteModel.findById(id).exec();
  }

  async findByProntuario(prontuario: number): Promise<Paciente> {
    return this.pacienteModel.findOne({ prontuario }).exec();
  }

  async search(query: string): Promise<Paciente[]> {
    const searchRegex = new RegExp(query, 'i');
    return this.pacienteModel.find({
      $or: [
        { nome: searchRegex },
        { 'documentos.cpf': searchRegex },
        { 'documentos.rg': searchRegex },
        { prontuario: isNaN(Number(query)) ? undefined : Number(query) },
      ].filter(Boolean),
    }).exec();
  }

  async getNextPaciente(currentId: string): Promise<Paciente | null> {
    const currentPaciente = await this.pacienteModel.findById(currentId);
    if (!currentPaciente) return null;
    
    return this.pacienteModel.findOne({
      prontuario: { $gt: currentPaciente.prontuario }
    }).sort({ prontuario: 1 }).exec();
  }

  async getPreviousPaciente(currentId: string): Promise<Paciente | null> {
    const currentPaciente = await this.pacienteModel.findById(currentId);
    if (!currentPaciente) return null;
    
    return this.pacienteModel.findOne({
      prontuario: { $lt: currentPaciente.prontuario }
    }).sort({ prontuario: -1 }).exec();
  }

  async create(createPacienteDto: any): Promise<Paciente> {
    const createdPaciente = new this.pacienteModel(createPacienteDto);
    return createdPaciente.save();
  }

  async update(id: string, updatePacienteDto: any): Promise<Paciente> {
    return this.pacienteModel.findByIdAndUpdate(id, updatePacienteDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Paciente> {
    return this.pacienteModel.findByIdAndDelete(id).exec();
  }
}
