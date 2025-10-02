import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PosOp, PosOpDocument } from './pos-op.entity';
import { Paciente, PacienteDocument } from '../schemas/paciente.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PosOpService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'pos-op');

  constructor(
    @InjectModel(PosOp.name) private posOpModel: Model<PosOpDocument>,
    @InjectModel(Paciente.name) private pacienteModel: Model<PacienteDocument>,
  ) {
    // Criar diretório de uploads se não existir
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async create(pacienteId: string, evolucaoId: string, condutaTratamentos: string): Promise<PosOp> {
    // Buscar dados do paciente
    const paciente = await this.pacienteModel.findById(pacienteId);
    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const posOp = new this.posOpModel({
      paciente_id: pacienteId,
      evolucao_id: evolucaoId,
      nome_paciente: paciente.nome,
      conduta_tratamentos: condutaTratamentos,
      exames: [],
    });

    return posOp.save();
  }

  async findByEvolucaoId(evolucaoId: string): Promise<PosOp> {
    return this.posOpModel.findOne({ evolucao_id: evolucaoId }).exec();
  }

  async uploadFile(
    pacienteId: string,
    evolucaoId: string,
    files: Array<any>,
    nomePaciente: string,
    dataPosOp?: string,
  ): Promise<PosOp> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Buscar ou criar registro de pós-op
    let posOp = await this.posOpModel.findOne({ evolucao_id: evolucaoId });
    
    if (!posOp) {
      posOp = new this.posOpModel({
        paciente_id: pacienteId,
        evolucao_id: evolucaoId,
        nome_paciente: nomePaciente,
        exames: [],
        conduta_tratamentos: '',
        data_pos_op: dataPosOp ? new Date(dataPosOp) : new Date(),
      });
    } else if (dataPosOp) {
      posOp.data_pos_op = new Date(dataPosOp);
    }

    // Processar cada arquivo
    for (const file of files) {
      const timestamp = Date.now();
      const nomeArquivo = `exames_${timestamp}_${file.originalname}`;
      const filePath = path.join(this.uploadsDir, nomeArquivo);

      // Salvar arquivo no disco
      fs.writeFileSync(filePath, file.buffer);

      // Adicionar ao array de exames
      posOp.exames.push({
        nome_original: file.originalname,
        nome_arquivo: nomeArquivo,
        tipo: file.mimetype,
        tamanho: file.size,
        data: new Date().toISOString(),
        data_upload: new Date(),
      });
    }

    posOp.data_atualizacao = new Date();
    return posOp.save();
  }

  async updateCondutaTratamentos(
    evolucaoId: string,
    condutaTratamentos: string,
  ): Promise<PosOp> {
    const posOp = await this.posOpModel.findOne({ evolucao_id: evolucaoId });
    
    if (!posOp) {
      throw new NotFoundException('Registro de pós-operatório não encontrado');
    }

    posOp.conduta_tratamentos = condutaTratamentos;
    posOp.data_atualizacao = new Date();
    
    return posOp.save();
  }

  async getFile(evolucaoId: string, nomeArquivo: string): Promise<Buffer> {
    const posOp = await this.posOpModel.findOne({ evolucao_id: evolucaoId });
    
    if (!posOp) {
      throw new NotFoundException('Registro de pós-operatório não encontrado');
    }

    const arquivo = posOp.exames.find(e => e.nome_arquivo === nomeArquivo);
    
    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const filePath = path.join(this.uploadsDir, nomeArquivo);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Arquivo não encontrado no sistema de arquivos');
    }

    return fs.readFileSync(filePath);
  }

  async removeFile(evolucaoId: string, nomeArquivo: string): Promise<PosOp> {
    const posOp = await this.posOpModel.findOne({ evolucao_id: evolucaoId });
    
    if (!posOp) {
      throw new NotFoundException('Registro de pós-operatório não encontrado');
    }

    // Remover do array
    posOp.exames = posOp.exames.filter(e => e.nome_arquivo !== nomeArquivo);
    posOp.data_atualizacao = new Date();

    // Remover arquivo do disco
    const filePath = path.join(this.uploadsDir, nomeArquivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return posOp.save();
  }

  async updateFileName(
    evolucaoId: string,
    nomeArquivo: string,
    novoNomeOriginal: string,
  ): Promise<PosOp> {
    const posOp = await this.posOpModel.findOne({ evolucao_id: evolucaoId });
    
    if (!posOp) {
      throw new NotFoundException('Registro de pós-operatório não encontrado');
    }

    // Encontrar e atualizar o nome original do arquivo
    const arquivo = posOp.exames.find(e => e.nome_arquivo === nomeArquivo);
    
    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    arquivo.nome_original = novoNomeOriginal;
    posOp.data_atualizacao = new Date();

    return posOp.save();
  }
}
