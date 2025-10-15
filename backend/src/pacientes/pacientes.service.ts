import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Paciente, PacienteDocument } from '../schemas/paciente.schema';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class PacientesService {
  constructor(
    @InjectModel(Paciente.name) private pacienteModel: Model<PacienteDocument>,
    private readonly openaiService: OpenAIService,
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

    const fs = require('fs');
    const path = require('path');
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    const OpenAI = require('openai').default;
    
    ffmpeg.setFfmpegPath(ffmpegPath);

    // Criar nome do arquivo MP3
    const mp3Filename = `${path.basename(file.filename, path.extname(file.filename))}.mp3`;
    const mp3Path = path.join(path.dirname(file.path), mp3Filename);

    // Converter para MP3
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(file.path)
          .toFormat('mp3')
          .audioBitrate('128k')
          .on('end', () => {
            console.log('✅ Conversão MP3 concluída');
            resolve(true);
          })
          .on('error', (err) => {
            console.error('❌ Erro na conversão MP3:', err.message);
            reject(err);
          })
          .save(mp3Path);
      });
    } catch (error) {
      console.error('❌ Erro ao converter áudio para MP3:', error.message);
      // Limpar arquivo temporário
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error('Arquivo de áudio inválido ou corrompido. Tente gravar novamente.');
    }

    // Transcrever com OpenAI Whisper API
    let transcricao = '';
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      console.log('🔑 Chave OpenAI configurada:', apiKey ? 'Sim (primeiros 10 chars: ' + apiKey.substring(0, 10) + '...)' : 'NÃO');
      
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY não configurada no arquivo .env');
      }

      const openai = new OpenAI({
        apiKey: apiKey,
      });

      console.log('📤 Enviando áudio para OpenAI Whisper API...');
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(mp3Path),
        model: 'whisper-1',
        language: 'pt',
        response_format: 'text',
      });

      transcricao = transcription;
      console.log('✅ Transcrição realizada com sucesso:', transcricao.substring(0, 100));
    } catch (error) {
      console.error('❌ Erro ao transcrever áudio:', error.message);
      console.error('Stack:', error.stack);
      transcricao = `Erro ao transcrever: ${error.message}`;
    }

    // Manter arquivo MP3 no servidor (não converter para base64)
    const audioUrl = `/uploads/hma/audio/${mp3Filename}`;

    console.log('💾 Salvando no banco:', {
      filename: mp3Filename,
      url: audioUrl,
      transcricaoLength: transcricao.length
    });
    
    // Adicionar novo áudio ao array hma_audios
    const pacienteAtualizado = await this.pacienteModel.findById(id);
    const audios = pacienteAtualizado.hma_audios || [];
    
    audios.push({
      filename: mp3Filename,
      url: audioUrl,
      transcricao: transcricao,
      data_gravacao: new Date(),
    });
    
    const updated = await this.pacienteModel.findByIdAndUpdate(
      id, 
      {
        hma_audios: audios,
      },
      { new: true }
    );
    
    console.log('✅ Salvo no banco:', {
      filename: mp3Filename,
      url: audioUrl,
      totalAudios: audios.length,
      transcricao: transcricao?.substring(0, 50)
    });

    // Remover apenas arquivo WebM temporário
    fs.unlinkSync(file.path);

    return {
      audioUrl,
      audioFilename: mp3Filename,
      transcricao,
      audios: updated.hma_audios,
      message: 'Áudio convertido para MP3 e transcrito com sucesso.',
    };
  }

  async deleteHmaAudio(id: string, audioFilename: string): Promise<any> {
    const paciente = await this.pacienteModel.findById(id);
    if (!paciente) {
      throw new Error('Paciente não encontrado');
    }

    const fs = require('fs');
    const path = require('path');

    // Remover áudio do array
    const audios = (paciente.hma_audios || []).filter(
      audio => audio.filename !== audioFilename
    );

    // Deletar arquivo físico
    const audioPath = path.join(__dirname, '../../uploads/hma/audio', audioFilename);
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
      console.log('🗑️ Arquivo deletado:', audioPath);
    }

    // Atualizar banco
    await this.pacienteModel.findByIdAndUpdate(id, {
      hma_audios: audios,
    });

    return {
      message: 'Áudio deletado com sucesso',
      audios,
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

  /**
   * Processa áudio e extrai dados estruturados automaticamente
   */
  async processAudioAndExtractData(id: string, file: any): Promise<any> {
    console.log('🎯 Iniciando processamento de áudio para paciente:', id);
    console.log('📁 Arquivo recebido:', file);
    
    const paciente = await this.pacienteModel.findById(id);
    if (!paciente) {
      console.error('❌ Paciente não encontrado:', id);
      throw new Error('Paciente não encontrado');
    }

    const audioPath = file.path;
    console.log('🎙️ Processando áudio:', audioPath);
    console.log('📊 Tamanho do arquivo:', file.size, 'bytes');

    try {
      // 1. Transcrever e extrair dados usando OpenAI
      console.log('🤖 Chamando OpenAI Service...');
      const { transcription, extractedData } = await this.openaiService.processAudioToStructuredData(audioPath);

      console.log('✅ Transcrição completa');
      console.log('✅ Dados extraídos:', JSON.stringify(extractedData, null, 2));

      // 2. Salvar áudio no array de áudios
      const audioUrl = `/uploads/hma/audio/${file.filename}`;
      const audioData = {
        filename: file.filename,
        url: audioUrl,
        transcricao: transcription,
        duracao: 0, // Pode ser calculado se necessário
        data_gravacao: new Date(),
      };

      // 3. Adicionar áudio ao array
      await this.pacienteModel.findByIdAndUpdate(id, {
        $push: { hma_audios: audioData },
        hma_transcricao: transcription,
      });

      // 4. Preparar dados para atualização do paciente
      const updateData: any = {};

      // 5. Mesclar dados extraídos com dados existentes
      if (extractedData.dados_pessoais) {
        if (extractedData.dados_pessoais.nome && !paciente.nome) {
          updateData.nome = extractedData.dados_pessoais.nome;
        }
        if (extractedData.dados_pessoais.idade && !paciente.idade) {
          updateData.idade = parseInt(extractedData.dados_pessoais.idade);
        }
        if (extractedData.dados_pessoais.sexo && !paciente.sexo) {
          updateData.sexo = extractedData.dados_pessoais.sexo;
        }
        if (extractedData.dados_pessoais.profissao && !paciente.profissao) {
          updateData.profissao = extractedData.dados_pessoais.profissao;
        }
      }

      // 6. Atualizar dados clínicos (SEMPRE atualizar, não apenas se vazio)
      if (extractedData.dados_clinicos) {
        const dadosClinicosAtuais = paciente.dados_clinicos || {};
        updateData.dados_clinicos = {
          ...dadosClinicosAtuais,
          ...extractedData.dados_clinicos,
        };
        console.log('💊 Dados clínicos a serem atualizados:', updateData.dados_clinicos);
      }

      // 7. Atualizar antecedentes (mesclar com existentes)
      if (extractedData.antecedentes) {
        const antecedentesAtuais: any = paciente.antecedentes || {};
        updateData.antecedentes = {
          paterno: { ...(antecedentesAtuais.paterno || {}), ...(extractedData.antecedentes.paterno || {}) },
          materno: { ...(antecedentesAtuais.materno || {}), ...(extractedData.antecedentes.materno || {}) },
          tios: { ...(antecedentesAtuais.tios || {}), ...(extractedData.antecedentes.tios || {}) },
          avos: { ...(antecedentesAtuais.avos || {}), ...(extractedData.antecedentes.avos || {}) },
        };
      }

      // 8. Atualizar HMA se houver
      if (extractedData.hma) {
        updateData.hma = extractedData.hma;
      }

      // 9. Atualizar diagnóstico e conduta se houver
      if (extractedData.diagnostico) {
        updateData.diagnostico = extractedData.diagnostico;
      }
      if (extractedData.conduta) {
        updateData.conduta = extractedData.conduta;
      }
      if (extractedData.exames_solicitados) {
        updateData.exames_solicitados = extractedData.exames_solicitados;
      }

      console.log('📝 Dados a serem atualizados:', JSON.stringify(updateData, null, 2));

      // 10. Atualizar paciente no banco
      const pacienteAtualizado = await this.pacienteModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      console.log('✅ Paciente atualizado com sucesso');

      return {
        message: 'Áudio processado e dados extraídos com sucesso',
        transcription,
        extractedData,
        audioUrl,
        paciente: pacienteAtualizado,
      };
    } catch (error) {
      console.error('❌ Erro ao processar áudio:', error);
      // Deletar arquivo em caso de erro
      const fs = require('fs');
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
      throw error;
    }
  }
}
