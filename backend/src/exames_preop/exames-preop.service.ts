import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExamePreopDto } from './dto/create-exame-preop.dto';
import { UpdateExamePreopDto } from './dto/update-exame-preop.dto';
import { ExamePreop, ExamePreopDocument } from './exame-preop.entity';

@Injectable()
export class ExamesPreopService {
  constructor(
    @InjectModel(ExamePreop.name) private examePreopModel: Model<ExamePreopDocument>
  ) {}

  async create(createExamePreopDto: CreateExamePreopDto): Promise<ExamePreop> {
    try {
      // Validar dados mínimos
      if (!createExamePreopDto.paciente_id) {
        throw new BadRequestException('ID do paciente é obrigatório');
      }
      
      const createdExamePreop = new this.examePreopModel(createExamePreopDto);
      return await createdExamePreop.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao criar exame pré-operatório: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const examesPreop = await this.examePreopModel.find().exec();
      return { examesPreop, total: examesPreop.length };
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao listar exames pré-operatórios: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const examePreop = await this.examePreopModel.findById(id).exec();
      if (!examePreop) {
        throw new NotFoundException(`Exame pré-operatório com ID ${id} não encontrado`);
      }
      return examePreop;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar exame pré-operatório: ${error.message}`);
    }
  }

  async findByPacienteId(pacienteId: string) {
    try {
      const examePreop = await this.examePreopModel.findOne({ paciente_id: pacienteId }).exec();
      return examePreop; // Pode ser null se não encontrar, o que é um comportamento válido
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar exame pré-operatório para o paciente ${pacienteId}: ${error.message}`);
    }
  }

  async update(id: string, updateExamePreopDto: UpdateExamePreopDto) {
    try {
      const examePreop = await this.examePreopModel.findByIdAndUpdate(
        id,
        { $set: updateExamePreopDto },
        { new: true }
      ).exec();
      
      if (!examePreop) {
        throw new NotFoundException(`Exame pré-operatório com ID ${id} não encontrado`);
      }
      
      return examePreop;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar exame pré-operatório: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const examePreop = await this.examePreopModel.findByIdAndDelete(id).exec();
      
      if (!examePreop) {
        throw new NotFoundException(`Exame pré-operatório com ID ${id} não encontrado`);
      }
      
      return examePreop;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover exame pré-operatório: ${error.message}`);
    }
  }

  async uploadFile(pacienteId: string, fieldName: string, fileData: {
    nome_arquivo: string;
    arquivo_binario: string;
    mime_type: string;
    observacoes?: string;
  }) {
    try {
      // Validar campo
      const validFields = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros'];
      if (!validFields.includes(fieldName)) {
        throw new BadRequestException(`Campo inválido: ${fieldName}. Campos válidos: ${validFields.join(', ')}`);
      }
      
      // Validar dados do arquivo
      if (!fileData.nome_arquivo) {
        throw new BadRequestException('Nome do arquivo é obrigatório');
      }
      
      if (!fileData.arquivo_binario) {
        throw new BadRequestException('Dados do arquivo são obrigatórios');
      }
      
      if (!fileData.mime_type) {
        throw new BadRequestException('Tipo MIME do arquivo é obrigatório');
      }

      // Buscar exame do paciente ou criar novo se não existir
      let examePreop = await this.findByPacienteId(pacienteId);
      
      if (!examePreop) {
        // Criar novo exame para o paciente
        const newExamePreop = new this.examePreopModel({
          paciente_id: pacienteId,
          data_cadastro: new Date()
        });
        examePreop = await newExamePreop.save();
      }

      // Atualizar o campo específico com o arquivo binário
      const updateData = {
        [`${fieldName}.tem_arquivo`]: true,
        [`${fieldName}.nome_arquivo`]: fileData.nome_arquivo,
        [`${fieldName}.data_upload`]: new Date(),
        [`${fieldName}.arquivo_binario`]: fileData.arquivo_binario,
        [`${fieldName}.mime_type`]: fileData.mime_type
      };

      if (fileData.observacoes) {
        updateData[`${fieldName}.observacoes`] = fileData.observacoes;
      }

      return await this.examePreopModel.findByIdAndUpdate(
        examePreop._id,
        { $set: updateData },
        { new: true }
      ).exec();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao fazer upload do arquivo: ${error.message}`);
    }
  }

  async removeFile(pacienteId: string, fieldName: string) {
    try {
      // Validar campo
      const validFields = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros'];
      if (!validFields.includes(fieldName)) {
        throw new BadRequestException(`Campo inválido: ${fieldName}. Campos válidos: ${validFields.join(', ')}`);
      }

      // Buscar exame do paciente
      const examePreop = await this.findByPacienteId(pacienteId);
      
      if (!examePreop) {
        throw new NotFoundException(`Exame não encontrado para o paciente: ${pacienteId}`);
      }
      
      // Verificar se o campo tem arquivo
      const field = examePreop[fieldName];
      if (!field || !field.tem_arquivo) {
        throw new NotFoundException(`Não há arquivo para remover no campo: ${fieldName}`);
      }

      // Limpar o campo específico
      const updateData = {
        [`${fieldName}.tem_arquivo`]: false,
        [`${fieldName}.nome_arquivo`]: '',
        [`${fieldName}.arquivo_binario`]: null,
        [`${fieldName}.mime_type`]: ''
      };

      return await this.examePreopModel.findByIdAndUpdate(
        examePreop._id,
        { $set: updateData },
        { new: true }
      ).exec();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover arquivo: ${error.message}`);
    }
  }

  async getFile(pacienteId: string, fieldName: string) {
    try {
      // Validar campo
      const validFields = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros'];
      if (!validFields.includes(fieldName)) {
        throw new BadRequestException(`Campo inválido: ${fieldName}. Campos válidos: ${validFields.join(', ')}`);
      }

      // Buscar exame do paciente
      const examePreop = await this.findByPacienteId(pacienteId);
      
      if (!examePreop) {
        throw new NotFoundException(`Exame não encontrado para o paciente: ${pacienteId}`);
      }

      // Retornar o arquivo binário do campo específico
      const field = examePreop[fieldName];
      if (!field || !field.tem_arquivo || !field.arquivo_binario) {
        throw new NotFoundException(`Arquivo não encontrado para o campo: ${fieldName}`);
      }

      return {
        nome_arquivo: field.nome_arquivo,
        arquivo_binario: field.arquivo_binario,
        mime_type: field.mime_type
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao recuperar arquivo: ${error.message}`);
    }
  }
}
