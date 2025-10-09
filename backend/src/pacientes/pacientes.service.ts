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

  async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ pacientes: Paciente[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const query = this.buildSearchQuery(filters);
    
    const [pacientes, total] = await Promise.all([
      this.pacienteModel.find(query).skip(skip).limit(limit).exec(),
      this.pacienteModel.countDocuments(query).exec(),
    ]);
    
    return {
      pacientes,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  private buildSearchQuery(filters?: any): any {
    if (!filters) return {};
    
    const query: any = {};
    const andConditions: any[] = [];

    // Busca geral em todos os campos (q)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchRegex = new RegExp(filters.searchQuery.trim(), 'i');
      const searchConditions: any[] = [
        { nome: searchRegex },
        { 'documentos.cpf': searchRegex },
        { 'documentos.rg': searchRegex },
        { 'contato.email': searchRegex },
        { 'contato.telefone': searchRegex },
        { 'contato.celular': searchRegex },
        { 'endereco.normalizado.logradouro': searchRegex },
        { 'endereco.normalizado.bairro': searchRegex },
        { 'endereco.normalizado.cidade': searchRegex },
        { 'endereco.normalizado.estado': searchRegex },
        { 'endereco.cep': searchRegex },
        { 'convenio.nome': searchRegex },
        { 'convenio.plano': searchRegex },
        { 'convenio.carteirinha': searchRegex },
        { indicacao: searchRegex }
      ];

      // Se for número, buscar também por prontuario e idade
      if (!isNaN(Number(filters.searchQuery))) {
        searchConditions.push({ prontuario: Number(filters.searchQuery) });
        searchConditions.push({ idade: Number(filters.searchQuery) });
      }

      andConditions.push({ $or: searchConditions });
    }

    // Filtros específicos por campo
    if (filters.nome) {
      andConditions.push({ nome: new RegExp(filters.nome, 'i') });
    }
    
    if (filters.cpf) {
      andConditions.push({ 'documentos.cpf': new RegExp(filters.cpf.replace(/\D/g, ''), 'i') });
    }
    
    if (filters.rg) {
      andConditions.push({ 'documentos.rg': new RegExp(filters.rg, 'i') });
    }
    
    if (filters.prontuario) {
      andConditions.push({ prontuario: Number(filters.prontuario) });
    }
    
    if (filters.sexo) {
      andConditions.push({ sexo: filters.sexo });
    }
    
    if (filters.profissao) {
      andConditions.push({ profissao: new RegExp(filters.profissao, 'i') });
    }
    
    if (filters.status) {
      andConditions.push({ status: new RegExp(filters.status, 'i') });
    }
    
    if (filters.convenio) {
      andConditions.push({ 'convenio.nome': new RegExp(filters.convenio, 'i') });
    }
    
    if (filters.email) {
      andConditions.push({ 'contato.email': new RegExp(filters.email, 'i') });
    }
    
    if (filters.telefone) {
      andConditions.push({ 'contato.telefone': new RegExp(filters.telefone, 'i') });
    }
    
    if (filters.celular) {
      andConditions.push({ 'contato.celular': new RegExp(filters.celular, 'i') });
    }
    
    if (filters.cidade) {
      andConditions.push({ 'endereco.normalizado.cidade': new RegExp(filters.cidade, 'i') });
    }
    
    if (filters.estado) {
      andConditions.push({ 'endereco.normalizado.estado': new RegExp(filters.estado, 'i') });
    }
    
    if (filters.carteirinha) {
      andConditions.push({ 'convenio.carteirinha': new RegExp(filters.carteirinha, 'i') });
    }
    
    if (filters.plano) {
      andConditions.push({ 'convenio.plano': new RegExp(filters.plano, 'i') });
    }
    
    if (filters.idade) {
      andConditions.push({ idade: Number(filters.idade) });
    }
    
    if (filters.indicacao) {
      andConditions.push({ indicacao: new RegExp(filters.indicacao, 'i') });
    }
    
    if (filters.dataPrimeiraConsulta) {
      andConditions.push({ dataPrimeiraConsulta: filters.dataPrimeiraConsulta });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    return query;
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

  async autocompleteNomes(query: string): Promise<string[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchRegex = new RegExp(`^${query.trim()}`, 'i');
    
    const pacientes = await this.pacienteModel.find({
      nome: searchRegex
    })
    .select('nome')
    .limit(20)
    .sort({ nome: 1 })
    .exec();

    return pacientes.map(p => p.nome).filter((nome, index, array) => array.indexOf(nome) === index);
  }

  async remove(id: string): Promise<Paciente> {
    return this.pacienteModel.findByIdAndDelete(id).exec();
  }

  async uploadHmaAudio(id: string, file: any): Promise<any> {
    const paciente = await this.pacienteModel.findById(id);
    if (!paciente) {
      throw new Error('Paciente não encontrado');
    }

    // Ler o arquivo e converter para base64
    const fs = require('fs');
    const audioBuffer = fs.readFileSync(file.path);
    const audioBase64 = audioBuffer.toString('base64');
    
    // TODO: Implementar transcrição com Whisper API
    const transcricao = 'Transcrição será implementada com Whisper API';

    await this.pacienteModel.findByIdAndUpdate(id, {
      hma_audio_data: audioBase64,
      hma_audio_type: file.mimetype,
      hma_audio_filename: file.originalname,
      hma_transcricao: transcricao,
    });

    // Remover arquivo temporário após salvar no banco
    fs.unlinkSync(file.path);

    return {
      audioData: audioBase64,
      audioType: file.mimetype,
      audioFilename: file.originalname,
      transcricao,
      message: 'Áudio salvo com sucesso no banco de dados.',
    };
  }

  async uploadHmaPdf(id: string, file: any): Promise<any> {
    const paciente = await this.pacienteModel.findById(id);
    if (!paciente) {
      throw new Error('Paciente não encontrado');
    }

    const pdfUrl = `/uploads/hma/pdf/${file.filename}`;

    await this.pacienteModel.findByIdAndUpdate(id, {
      hma_resumo_pdf: file.filename,
    });

    return {
      pdfUrl,
      filename: file.filename,
      message: 'PDF enviado com sucesso',
    };
  }
}
