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
    },
    "tios": {
      "dm": false,
      "has": false,
      "iam": false,
      "avc": false,
      "dislipidemia": false,
      "neoplasias": false,
      "outros": false
    },
    "avos": {
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
- Para peso, extraia apenas números sem unidade (ex: "85.2" para "85.2 quilos" ou "85.2 kg")
- Para altura, extraia em metros com ponto decimal (ex: "1.78" para "1 metro e 78" ou "178 cm")
- Para medicações, retorne array de strings incluindo nome, dosagem E frequência/horários
  * Se houver múltiplas doses no dia, especifique cada horário (ex: "30U manhã, 60U almoço, 90U noite")
  * Use formato compacto e claro (ex: "U" para unidades, "mg" para miligramas)
- Para exames, retorne array de strings (ex: ["Hemograma", "Glicemia"])
- A transcrição completa deve ir no campo "hma.transcricao"
- Identifique sinônimos: "hipertensão" = "has", "pressão alta" = "has", "açúcar no sangue" = "diabetes"

ANTECEDENTES FAMILIARES:
- "pai" ou "paterno" → antecedentes.paterno
- "mãe" ou "materno" → antecedentes.materno
- "tio" ou "tia" → antecedentes.tios
- "avô" ou "avó" ou "avós" → antecedentes.avos

EXEMPLOS DE EXTRAÇÃO:
- "peso 95 quilos" → peso: "95"
- "1 metro e 60" → altura: "1.60"
- "tem diabetes" → diabetes: true
- "toma losartana 50mg uma vez ao dia" → medicacoes_preop: ["Losartana 50mg 1x/dia"]
- "usa metformina 850 duas vezes por dia" → medicacoes_preop: ["Metformina 850mg 2x/dia"]
- "toma atenolol 25 miligramas pela manhã" → medicacoes_preop: ["Atenolol 25mg manhã"]
- "insulina NPH 30 unidades de manhã, 60 unidades no almoço, 90 unidades à noite" → medicacoes_preop: ["Insulina NPH 30U manhã, 60U almoço, 90U noite"]
- "insulina regular 10 unidades antes do café, 15 antes do almoço" → medicacoes_preop: ["Insulina Regular 10U café, 15U almoço"]
- "pai tinha diabetes" → antecedentes.paterno.dm: true
- "mãe com pressão alta" → antecedentes.materno.has: true
- "tio teve AVC" → antecedentes.tios.avc: true
- "avô com neoplasia" → antecedentes.avos.neoplasias: true

Texto da consulta:
${transcription}`,
          },
        ],
      });

      const extractedData = JSON.parse(completion.choices[0].message.content);
      
      console.log('📊 Dados extraídos pelo GPT:', JSON.stringify(extractedData, null, 2));
      
      // Calcular IMC se peso e altura estiverem presentes
      if (extractedData.dados_clinicos?.peso && extractedData.dados_clinicos?.altura) {
        const peso = parseFloat(extractedData.dados_clinicos.peso);
        const altura = parseFloat(extractedData.dados_clinicos.altura);
        console.log(`🧮 Calculando IMC: peso=${peso}, altura=${altura}`);
        if (!isNaN(peso) && !isNaN(altura) && altura > 0) {
          extractedData.dados_clinicos.imc = (peso / (altura * altura)).toFixed(2);
          console.log(`✅ IMC calculado: ${extractedData.dados_clinicos.imc}`);
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
   * Analisa a personalidade do paciente com base no Enneagrama
   */
  async analisarPersonalidade(texto: string): Promise<{
    tipo: string;
    justificativa: string;
  }> {
    try {
      console.log('🧠 Iniciando análise de personalidade...');
      
      const prompt = `Você é o **Agente de Personalidade da Clínica de Cirurgia Bariátrica e Metabólica do Dr. José Luis Lopes Corrêa**. 

Sua função é analisar conversas com pacientes e identificar o perfil de personalidade com base no Enneagrama.

## 🧠 TIPOS DE PERSONALIDADE (ENNEAGRAMA)

1. **Perfeccionista (Reformador):** busca o certo, é ético, exigente e quer fazer tudo corretamente.
2. **Prestativo (Ajudador):** empático, gosta de ajudar, precisa sentir-se útil e querido.
3. **Realizador (Bem-sucedido):** prático, competitivo, quer resultados e reconhecimento.
4. **Individualista (Sensível):** emocional, autêntico, valoriza sua história e identidade.
5. **Investigador (Analítico):** racional, observador, busca dados e explicações detalhadas.
6. **Leal (Cauteloso):** inseguro, cuidadoso, busca previsibilidade e confiança na equipe.
7. **Entusiasta (Otimista):** alegre, curioso, busca novidades e experiências positivas.
8. **Desafiador (Líder):** decidido, controlador, assertivo, valoriza autonomia e força.
9. **Pacificador (Mediador):** tranquilo, paciente, busca harmonia e evita conflito.

## 🧾 FORMATO DE RESPOSTA (JSON)

Retorne APENAS um JSON válido com esta estrutura:
{
  "tipo": "Tipo X – Nome",
  "justificativa": "Explicação detalhada do motivo da classificação, incluindo palavras-chave e comportamentos observados"
}

## 💬 TEXTO PARA ANÁLISE

"""${texto}"""

Analise o texto acima e retorne o JSON com tipo e justificativa detalhada.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de personalidade baseada no Enneagrama. Retorne sempre JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const resultado = JSON.parse(completion.choices[0].message.content);
      console.log('✅ Análise de personalidade concluída:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('❌ Erro ao analisar personalidade:', error);
      throw new Error('Falha na análise de personalidade');
    }
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
