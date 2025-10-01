import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExamePreopDto } from './dto/create-exame-preop.dto';
import { UpdateExamePreopDto } from './dto/update-exame-preop.dto';
import { ExamePreop, ExamePreopDocument } from './exame-preop.entity';
import { Paciente, PacienteDocument } from '../schemas/paciente.schema';

@Injectable()
export class ExamesPreopService {
  constructor(
    @InjectModel(ExamePreop.name) private examePreopModel: Model<ExamePreopDocument>,
    @InjectModel(Paciente.name) private pacienteModel: Model<PacienteDocument>
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
        // Buscar dados do paciente para obter o nome
        const paciente = await this.pacienteModel.findById(pacienteId).exec();
        if (!paciente) {
          throw new NotFoundException(`Paciente com ID ${pacienteId} não encontrado`);
        }
        
        // Criar novo exame para o paciente com nome_paciente
        const newExamePreop = new this.examePreopModel({
          paciente_id: pacienteId,
          nome_paciente: paciente.nome,
          data_cadastro: new Date(),
          data_atualizacao: new Date()
        });
        examePreop = await newExamePreop.save();
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const nomeArquivoUnico = `${fieldName}_${timestamp}_${fileData.nome_arquivo}`;

      // Calcular tamanho do arquivo (Base64 para bytes)
      const tamanhoBytes = Math.floor((fileData.arquivo_binario.length * 3) / 4);

      // Criar objeto do arquivo para adicionar ao array
      const novoArquivo = {
        nome_original: fileData.nome_arquivo,
        nome_arquivo: nomeArquivoUnico,
        tipo: fileData.mime_type,
        tamanho: tamanhoBytes,
        data: fileData.arquivo_binario,
        data_upload: new Date()
      };

      // Adicionar arquivo ao array usando $push
      return await this.examePreopModel.findByIdAndUpdate(
        examePreop._id,
        { 
          $push: { [fieldName]: novoArquivo },
          $set: { data_atualizacao: new Date() }
        },
        { new: true }
      ).exec();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao fazer upload do arquivo: ${error.message}`);
    }
  }

  async removeFile(pacienteId: string, fieldName: string, nomeArquivo: string) {
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
      
      // Verificar se o campo tem arquivos
      const field = examePreop[fieldName];
      if (!field || !Array.isArray(field) || field.length === 0) {
        throw new NotFoundException(`Não há arquivos no campo: ${fieldName}`);
      }

      // Remover arquivo específico do array usando $pull
      return await this.examePreopModel.findByIdAndUpdate(
        examePreop._id,
        { 
          $pull: { [fieldName]: { nome_arquivo: nomeArquivo } },
          $set: { data_atualizacao: new Date() }
        },
        { new: true }
      ).exec();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover arquivo: ${error.message}`);
    }
  }

  async getFile(pacienteId: string, fieldName: string, nomeArquivo: string) {
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

      // Buscar arquivo específico no array
      const field = examePreop[fieldName];
      if (!field || !Array.isArray(field) || field.length === 0) {
        throw new NotFoundException(`Não há arquivos no campo: ${fieldName}`);
      }
      
      const arquivo = field.find(f => f.nome_arquivo === nomeArquivo);
      if (!arquivo || !arquivo.data) {
        throw new NotFoundException(`Arquivo ${nomeArquivo} não encontrado no campo: ${fieldName}`);
      }

      return {
        nome_original: arquivo.nome_original,
        nome_arquivo: arquivo.nome_arquivo,
        tipo: arquivo.tipo,
        tamanho: arquivo.tamanho,
        data: arquivo.data,
        data_upload: arquivo.data_upload
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao recuperar arquivo: ${error.message}`);
    }
  }
}
