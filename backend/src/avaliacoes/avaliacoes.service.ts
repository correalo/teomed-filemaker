import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avaliacao, AvaliacaoDocument } from './avaliacao.entity';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(
    @InjectModel(Avaliacao.name) private avaliacaoModel: Model<AvaliacaoDocument>,
  ) {}

  async create(createAvaliacaoDto: CreateAvaliacaoDto): Promise<Avaliacao> {
    const avaliacao = new this.avaliacaoModel({
      ...createAvaliacaoDto,
      data_criacao: new Date(),
      data_atualizacao: new Date(),
    });
    return avaliacao.save();
  }

  async findAll(): Promise<Avaliacao[]> {
    return this.avaliacaoModel.find().sort({ data_atualizacao: -1 }).exec();
  }

  async findOne(id: string): Promise<Avaliacao> {
    return this.avaliacaoModel.findById(id).exec();
  }

  async findByPacienteId(pacienteId: string): Promise<Avaliacao> {
    return this.avaliacaoModel.findOne({ paciente_id: pacienteId }).exec();
  }

  async update(id: string, updateAvaliacaoDto: UpdateAvaliacaoDto): Promise<Avaliacao> {
    return this.avaliacaoModel.findByIdAndUpdate(
      id,
      { ...updateAvaliacaoDto, data_atualizacao: new Date() },
      { new: true }
    ).exec();
  }

  async updateByPacienteId(pacienteId: string, updateAvaliacaoDto: UpdateAvaliacaoDto): Promise<Avaliacao> {
    const existingAvaliacao = await this.findByPacienteId(pacienteId);
    
    if (existingAvaliacao) {
      return this.avaliacaoModel.findByIdAndUpdate(
        (existingAvaliacao as any)._id,
        { ...updateAvaliacaoDto, data_atualizacao: new Date() },
        { new: true }
      ).exec();
    } else {
      // Criar nova avaliação se não existir
      return this.create({
        paciente_id: pacienteId,
        ...updateAvaliacaoDto,
      } as CreateAvaliacaoDto);
    }
  }

  async remove(id: string): Promise<Avaliacao> {
    return this.avaliacaoModel.findByIdAndDelete(id).exec();
  }

  async addFileToField(
    pacienteId: string,
    fieldName: string,
    fileInfo: {
      nome_original: string;
      nome_arquivo: string;
      tipo: string;
      tamanho: number;
      data: string; // Base64
    }
  ): Promise<Avaliacao> {
    const avaliacao = await this.findByPacienteId(pacienteId);
    
    if (avaliacao) {
      const updateData = {
        [fieldName]: [...(avaliacao[fieldName] || []), { ...fileInfo, data_upload: new Date() }],
        data_atualizacao: new Date(),
      };
      
      return this.avaliacaoModel.findByIdAndUpdate(
        (avaliacao as any)._id,
        updateData,
        { new: true }
      ).exec();
    } else {
      // Criar nova avaliação com o arquivo
      const createData = {
        paciente_id: pacienteId,
        nome_paciente: '', // Será preenchido pelo controller
        [fieldName]: [{ ...fileInfo, data_upload: new Date() }],
      };
      
      return this.create(createData as CreateAvaliacaoDto);
    }
  }

  async removeFileFromField(
    pacienteId: string,
    fieldName: string,
    fileName: string
  ): Promise<Avaliacao> {
    const avaliacao = await this.findByPacienteId(pacienteId);
    
    if (avaliacao && avaliacao[fieldName]) {
      const updatedFiles = avaliacao[fieldName].filter(
        file => file.nome_arquivo !== fileName
      );
      
      const updateData = {
        [fieldName]: updatedFiles,
        data_atualizacao: new Date(),
      };
      
      return this.avaliacaoModel.findByIdAndUpdate(
        (avaliacao as any)._id,
        updateData,
        { new: true }
      ).exec();
    }
    
    return avaliacao;
  }
}
