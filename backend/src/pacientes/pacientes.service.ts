import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
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

  private calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  async create(createPacienteDto: any): Promise<Paciente> {
    // Calcular idade automaticamente se data de nascimento fornecida
    if (createPacienteDto.dataNascimento) {
      createPacienteDto.idade = this.calculateAge(createPacienteDto.dataNascimento);
    }
    
    const createdPaciente = new this.pacienteModel(createPacienteDto);
    return createdPaciente.save();
  }

  async update(id: string, updatePacienteDto: any): Promise<Paciente> {
    // Calcular idade automaticamente se data de nascimento foi atualizada
    if (updatePacienteDto.dataNascimento) {
      updatePacienteDto.idade = this.calculateAge(updatePacienteDto.dataNascimento);
    }
    
    return this.pacienteModel.findByIdAndUpdate(id, updatePacienteDto, { new: true }).exec();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateAllAges(): Promise<void> {
    console.log('Iniciando atualização automática de idades...');
    
    try {
      const pacientes = await this.pacienteModel.find({ dataNascimento: { $exists: true, $ne: null } });
      
      for (const paciente of pacientes) {
        const newAge = this.calculateAge(paciente.dataNascimento);
        
        if (paciente.idade !== newAge) {
          await this.pacienteModel.findByIdAndUpdate(
            paciente._id,
            { idade: newAge, atualizadoEm: new Date() },
            { new: true }
          );
          console.log(`Idade atualizada para paciente ${paciente.nome}: ${paciente.idade} → ${newAge}`);
        }
      }
      
      console.log('Atualização de idades concluída.');
    } catch (error) {
      console.error('Erro ao atualizar idades:', error);
    }
  }

  async remove(id: string): Promise<Paciente> {
    return this.pacienteModel.findByIdAndDelete(id).exec();
  }
}
