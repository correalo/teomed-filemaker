import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exame, ExameDocument } from './exame.entity';
import { CreateExameDto } from './dto/create-exame.dto';
import { UpdateExameDto } from './dto/update-exame.dto';

@Injectable()
export class ExamesService {
  constructor(
    @InjectModel(Exame.name) private exameModel: Model<ExameDocument>
  ) {}

  async create(createExameDto: CreateExameDto): Promise<Exame> {
    const createdExame = new this.exameModel(createExameDto);
    return createdExame.save();
  }

  async findAll(): Promise<Exame[]> {
    return this.exameModel.find().exec();
  }

  async findOne(id: string): Promise<Exame> {
    return this.exameModel.findById(id).exec();
  }

  async findByPacienteId(pacienteId: string): Promise<Exame> {
    return this.exameModel.findOne({ paciente_id: pacienteId }).exec();
  }

  async update(id: string, updateExameDto: UpdateExameDto): Promise<Exame> {
    return this.exameModel.findByIdAndUpdate(id, updateExameDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Exame> {
    return this.exameModel.findByIdAndDelete(id).exec();
  }

  async addFileToField(
    pacienteId: string,
    fieldName: string,
    fileInfo: {
      nome_original: string;
      nome_arquivo: string;
      tipo: string;
      tamanho: number;
      data: string;
    }
  ): Promise<Exame> {
    const exame = await this.findByPacienteId(pacienteId);
    
    if (exame) {
      const updateData = {
        [fieldName]: [...(exame[fieldName] || []), { ...fileInfo, data_upload: new Date() }],
        data_atualizacao: new Date(),
      };
      
      return this.exameModel.findByIdAndUpdate(
        exame._id,
        { $set: updateData },
        { new: true }
      ).exec();
    } else {
      // Se não existir avaliação para este paciente, criar uma nova
      const createData = {
        paciente_id: pacienteId,
        nome_paciente: '', // Será preenchido pelo controller
        [fieldName]: [{ ...fileInfo, data_upload: new Date() }],
      };
      
      return this.create(createData as CreateExameDto);
    }
  }

  async removeFileFromField(
    pacienteId: string,
    fieldName: string,
    fileName: string
  ): Promise<Exame> {
    const exame = await this.findByPacienteId(pacienteId);
    
    if (!exame || !exame[fieldName]) {
      throw new Error('Arquivo não encontrado');
    }
    
    const fileIndex = exame[fieldName].findIndex(f => f.nome_arquivo === fileName);
    
    if (fileIndex === -1) {
      throw new Error('Arquivo não encontrado');
    }
    
    const updatedFiles = [...exame[fieldName]];
    updatedFiles.splice(fileIndex, 1);
    
    return this.exameModel.findByIdAndUpdate(
      exame._id,
      { 
        $set: { 
          [fieldName]: updatedFiles,
          data_atualizacao: new Date()
        } 
      },
      { new: true }
    ).exec();
  }
}
