import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY não encontrada no .env');
      throw new Error('OPENAI_API_KEY não configurada');
    }
    
    console.log('✅ OpenAI Service inicializado');
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Transcreve um arquivo de áudio usando Whisper
   */
  async transcribeAudio(audioPath: string): Promise<string> {
    console.log('🎤 Iniciando transcrição do áudio:', audioPath);
    
    try {
      // Verificar se o arquivo existe
      if (!fs.existsSync(audioPath)) {
        console.error('❌ Arquivo de áudio não encontrado:', audioPath);
        throw new Error(`Arquivo não encontrado: ${audioPath}`);
      }

      const stats = fs.statSync(audioPath);
      console.log('📊 Tamanho do arquivo:', stats.size, 'bytes');

      if (stats.size === 0) {
        console.error('❌ Arquivo de áudio vazio');
        throw new Error('Arquivo de áudio está vazio');
      }

      console.log('🌐 Enviando para OpenAI Whisper...');
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        language: 'pt',
      });

      console.log('✅ Transcrição recebida:', transcription.text.substring(0, 100) + '...');
      return transcription.text;
    } catch (error: any) {
      console.error('❌ Erro ao transcrever áudio:', error.message);
      console.error('Stack:', error.stack);
      throw new Error(`Falha na transcrição: ${error.message}`);
    }
  }

  /**
   * Extrai dados estruturados de uma transcrição médica
   */
  async extractMedicalData(transcription: string): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Você é um assistente médico especializado em estruturar transcrições de consultas médicas.
Extraia APENAS as informações que estão EXPLICITAMENTE mencionadas no texto.
Se uma informação não estiver presente, deixe o campo vazio ("").
Seja preciso e não invente dados.`,
          },
          {
            role: 'user',
            content: `Extraia do texto abaixo os dados em formato JSON com os seguintes campos:

{
  "dados_pessoais": {
    "nome": "",
    "idade": "",
    "sexo": "",
    "profissao": ""
  },
  "dados_clinicos": {
    "peso": "",
    "altura": "",
    "imc": "",
    "has": false,
    "diabetes": false,
    "dislipidemia": false,
    "apneia": false,
    "artropatias": false,
    "ccc": false,
    "esteatose": false,
    "hernia_hiato": false,
    "refluxo": false,
    "hernia_incisional": false,
    "ico": false,
    "iam": false,
    "icc": false,
    "avc": false,
    "fa": false,
    "cardiomiopatia_dilatada": false,
    "asma": false,
    "incontinencia_urinaria_feminina": false,
    "infertilidade": false,
    "ovario_policistico": false,
    "hemorroidas": false,
    "varizes_mmii": false,
    "hipertensao_intracraniana_idiopatica": false,
    "depressao": false,
    "estigma_social": false,
    "alergias": "",
    "outras_doencas": "",
    "medicacoes_preop": []
  },
  "hma": {
    "transcricao": "",
    "queixa_principal": "",
    "historia_doenca_atual": "",
    "duracao_sintomas": ""
  },
  "antecedentes": {
    "paterno": {
      "dm": false,
      "has": false,
      "iam": false,
      "avc": false,
      "dislipidemia": false,
      "neoplasias": false,
      "outros": false
    },
    "materno": {
      "dm": false,
      "has": false,
      "iam": false,
      "avc": false,
      "dislipidemia": false,
      "neoplasias": false,
      "outros": false
    }
  },
  "exame_fisico": {
    "descricao": ""
  },
  "diagnostico": "",
  "conduta": "",
  "exames_solicitados": [],
  "observacoes": ""
}

IMPORTANTE:
- Para campos booleanos (true/false), marque true APENAS se a condição for EXPLICITAMENTE mencionada
- Para peso e altura, extraia apenas números (ex: "85.2" para peso, "1.78" para altura)
- Para medicações e exames, retorne como array de strings
- A transcrição completa deve ir no campo "hma.transcricao"

Texto da consulta:
${transcription}`,
          },
        ],
      });

      const extractedData = JSON.parse(completion.choices[0].message.content);
      
      // Calcular IMC se peso e altura estiverem presentes
      if (extractedData.dados_clinicos?.peso && extractedData.dados_clinicos?.altura) {
        const peso = parseFloat(extractedData.dados_clinicos.peso);
        const altura = parseFloat(extractedData.dados_clinicos.altura);
        if (!isNaN(peso) && !isNaN(altura) && altura > 0) {
          extractedData.dados_clinicos.imc = (peso / (altura * altura)).toFixed(2);
        }
      }

      return extractedData;
    } catch (error) {
      console.error('Erro ao extrair dados médicos:', error);
      throw new Error('Falha na extração de dados estruturados');
    }
  }

  /**
   * Processa áudio completo: transcreve e extrai dados
   */
  async processAudioToStructuredData(audioPath: string): Promise<{
    transcription: string;
    extractedData: any;
  }> {
    // 1. Transcrever áudio
    const transcription = await this.transcribeAudio(audioPath);

    // 2. Extrair dados estruturados
    const extractedData = await this.extractMedicalData(transcription);

    return {
      transcription,
      extractedData,
    };
  }

  /**
   * Gera resumo do HMA em PDF (texto formatado)
   */
  async generateHMASummary(transcription: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um médico especialista em criar resumos estruturados de História da Moléstia Atual (HMA).',
          },
          {
            role: 'user',
            content: `Crie um resumo médico estruturado e profissional da seguinte transcrição de consulta:

${transcription}

O resumo deve conter:
1. Identificação do paciente (se mencionado)
2. Queixa principal
3. História da doença atual
4. Sintomas associados
5. Fatores de melhora/piora
6. Tratamentos prévios

Use linguagem médica formal e seja conciso.`,
          },
        ],
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao gerar resumo HMA:', error);
      throw new Error('Falha ao gerar resumo');
    }
  }
}
