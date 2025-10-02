import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evolucao, EvolucaoDocument } from './evolucao.entity';
import { CreateEvolucaoDto } from './dto/create-evolucao.dto';
import { UpdateEvolucaoDto } from './dto/update-evolucao.dto';
import { Paciente, PacienteDocument } from '../schemas/paciente.schema';

@Injectable()
export class EvolucoesService {
  constructor(
    @InjectModel(Evolucao.name) private evolucaoModel: Model<EvolucaoDocument>,
    @InjectModel(Paciente.name) private pacienteModel: Model<PacienteDocument>,
  ) {}

  async create(createEvolucaoDto: CreateEvolucaoDto): Promise<Evolucao> {
    const createdEvolucao = new this.evolucaoModel(createEvolucaoDto);
    return createdEvolucao.save();
  }

  async findAll(): Promise<Evolucao[]> {
    return this.evolucaoModel.find().exec();
  }

  async findByPacienteId(pacienteId: string): Promise<Evolucao[]> {
    // Buscar evoluções e sincronizar nome do paciente
    const evolucoes = await this.evolucaoModel.find({ paciente_id: pacienteId }).exec();
    
    // Para cada evolução, buscar o nome atual do paciente na coleção pacientes
    const evolucoesComNomeAtualizado = await Promise.all(
      evolucoes.map(async (evolucao) => {
        try {
          // Buscar o paciente na coleção pacientes pelo ID
          const paciente = await this.pacienteModel.findById(pacienteId).exec();
          
          if (paciente && paciente.nome) {
            // Atualizar o nome_paciente na evolução se for diferente
            if (evolucao.nome_paciente !== paciente.nome) {
              await this.evolucaoModel.updateOne(
                { _id: evolucao._id },
                { nome_paciente: paciente.nome }
              );
              // Retornar a evolução com o nome atualizado
              return { ...evolucao.toObject(), nome_paciente: paciente.nome };
            }
          }
          
          return evolucao;
        } catch (error) {
          console.error('Erro ao buscar nome do paciente:', error);
          return evolucao;
        }
      })
    );
    
    return evolucoesComNomeAtualizado;
  }

  async findOne(id: string): Promise<Evolucao> {
    return this.evolucaoModel.findById(id).exec();
  }

  async update(id: string, updateEvolucaoDto: UpdateEvolucaoDto): Promise<Evolucao> {
    // Se a data está no formato dd/MM/yyyy, converter para Date sem problemas de timezone
    if (updateEvolucaoDto.data_retorno && typeof updateEvolucaoDto.data_retorno === 'string') {
      const dateStr = updateEvolucaoDto.data_retorno as string;
      
      // Se está no formato dd/MM/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        // Criar data no meio-dia UTC para evitar problemas de timezone
        updateEvolucaoDto.data_retorno = new Date(`${year}-${month}-${day}T12:00:00.000Z`) as any;
      }
    }
    
    return this.evolucaoModel.findByIdAndUpdate(id, updateEvolucaoDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Evolucao> {
    return this.evolucaoModel.findByIdAndDelete(id).exec();
  }

  async search(searchFields: any): Promise<Evolucao[]> {
    console.log('Parâmetros de busca recebidos:', searchFields);
    
    // Usar $or para buscar por ID OU nome
    const orConditions = [];
    const query: any = {};
    
    // Se tiver ID do paciente, adicionar à condição OR
    if (searchFields.paciente_id) {
      try {
        const mongoose = require('mongoose');
        // Tentar converter para ObjectId se for uma string válida de ObjectId
        if (mongoose.Types.ObjectId.isValid(searchFields.paciente_id)) {
          orConditions.push({ paciente_id: searchFields.paciente_id });
          // Também adicionar a versão string para garantir compatibilidade
          orConditions.push({ paciente_id: searchFields.paciente_id.toString() });
        } else {
          // Se não for um ObjectId válido, buscar pela string diretamente
          orConditions.push({ paciente_id: searchFields.paciente_id });
        }
      } catch (error) {
        // Em caso de erro, usar a string diretamente
        orConditions.push({ paciente_id: searchFields.paciente_id });
      }
      console.log(`Adicionando condição de busca por ID: ${searchFields.paciente_id}`);
    }
    
    // Se tiver nome do paciente, adicionar à condição OR
    if (searchFields.nome_paciente) {
      orConditions.push({ 
        nome_paciente: { $regex: searchFields.nome_paciente, $options: 'i' } 
      });
      console.log(`Adicionando condição de busca por nome: ${searchFields.nome_paciente}`);
    }
    
    // Se tiver condições OR, adicionar ao query principal
    if (orConditions.length > 0) {
      query.$or = orConditions;
    }
    
    // Adicionar outros filtros se existirem
    if (searchFields.data_retorno) {
      query.data_retorno = searchFields.data_retorno;
    }
    
    if (searchFields.exames_alterados) {
      query.exames_alterados = { $regex: searchFields.exames_alterados, $options: 'i' };
    }
    
    console.log('Query final MongoDB:', JSON.stringify(query, null, 2));
    
    const result = await this.evolucaoModel.find(query).exec();
    console.log(`Encontradas ${result.length} evoluções`);
    
    return result;
  }
}
