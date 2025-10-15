# 🤖 Preenchimento Automático do CRM com IA

## 📋 Visão Geral

Sistema de preenchimento automático do CRM usando **Whisper** (transcrição de áudio) + **GPT-4** (extração de dados estruturados).

## ✨ Funcionalidades

### 1. Transcrição de Áudio
- Usa **OpenAI Whisper** para transcrever consultas médicas em português
- Suporta formatos: WAV, MP3, M4A, WebM, OGG
- Limite: 50MB por arquivo

### 2. Extração Automática de Dados
O GPT-4 extrai automaticamente:

#### Dados Pessoais
- Nome
- Idade
- Sexo
- Profissão

#### Dados Clínicos
- Peso e Altura (com cálculo automático de IMC)
- Comorbidades (HAS, Diabetes, Dislipidemia, etc.)
- Alergias
- Medicações em uso

#### História da Moléstia Atual (HMA)
- Transcrição completa
- Queixa principal
- História da doença atual
- Duração dos sintomas

#### Antecedentes Familiares
- Paterno (DM, HAS, IAM, AVC, etc.)
- Materno (DM, HAS, IAM, AVC, etc.)

#### Outros
- Exame físico
- Diagnóstico
- Conduta
- Exames solicitados

## 🚀 Como Usar

### 1. Configurar API Key da OpenAI

No arquivo `/backend/.env`:

```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

### 2. Gravar Consulta

1. Abra o card do paciente
2. Ative o modo de edição (botão "Editar")
3. Na seção **HMA**, clique no botão 🎤 para iniciar gravação
4. Grave a consulta médica (fale naturalmente)
5. Clique em ⏹️ para parar a gravação

### 3. Preencher Automaticamente

1. Após gravar, aparecerá o botão **✨ Preencher Automático**
2. Clique nele
3. Aguarde o processamento (pode levar 10-30 segundos)
4. Os campos serão preenchidos automaticamente!

## 🎯 Exemplo de Uso

### Gravação de Exemplo:

> "Paciente João Silva, 45 anos, sexo masculino, profissão motorista. Peso 120 quilos, altura 1 metro e 75. Queixa principal: obesidade há 10 anos. Relata que já tentou várias dietas sem sucesso. Tem diabetes tipo 2 e hipertensão arterial. Usa metformina 850mg e losartana 50mg. Pai teve infarto aos 60 anos. Mãe tem diabetes. Exame físico: paciente obeso, pressão arterial 140 por 90. Diagnóstico: obesidade grau 2 com comorbidades. Conduta: solicitar exames pré-operatórios e encaminhar para avaliação multidisciplinar."

### Resultado Automático:

```json
{
  "dados_pessoais": {
    "nome": "João Silva",
    "idade": "45",
    "sexo": "Masculino",
    "profissao": "Motorista"
  },
  "dados_clinicos": {
    "peso": "120",
    "altura": "1.75",
    "imc": "39.18",
    "diabetes": true,
    "has": true,
    "medicacoes_preop": ["Metformina 850mg", "Losartana 50mg"]
  },
  "hma": {
    "queixa_principal": "Obesidade há 10 anos",
    "historia_doenca_atual": "Tentou várias dietas sem sucesso",
    "duracao_sintomas": "10 anos"
  },
  "antecedentes": {
    "paterno": {
      "iam": true
    },
    "materno": {
      "dm": true
    }
  },
  "diagnostico": "Obesidade grau 2 com comorbidades",
  "conduta": "Solicitar exames pré-operatórios e encaminhar para avaliação multidisciplinar"
}
```

## 🔒 Segurança e Privacidade

### ✅ Boas Práticas Implementadas

1. **Autenticação JWT**: Todas as requisições exigem token válido
2. **Armazenamento Local**: Áudios salvos localmente no servidor
3. **Sem Armazenamento na OpenAI**: Transcrições não são salvas nos servidores da OpenAI
4. **HTTPS Recomendado**: Use HTTPS em produção
5. **Criptografia**: Considere criptografar áudios em disco (LGPD)

### ⚠️ Importante

- **Não compartilhe** sua API Key da OpenAI
- **Revise sempre** os dados extraídos antes de salvar
- **Backup regular** dos áudios e transcrições
- **Conformidade LGPD**: Obtenha consentimento do paciente para gravação

## 🛠️ Arquitetura Técnica

### Backend (NestJS)

```
/backend/src/openai/
├── openai.service.ts    # Serviço de IA (Whisper + GPT)
└── openai.module.ts     # Módulo OpenAI

/backend/src/pacientes/
├── pacientes.controller.ts  # Endpoint POST /pacientes/:id/hma/audio/process
└── pacientes.service.ts     # Lógica de processamento e merge de dados
```

### Frontend (React/Next.js)

```
/frontend/src/components/
├── AudioRecorder.tsx    # Componente de gravação com botão "Preencher Automático"
└── PacienteCard.tsx     # Integração e chamada da API
```

### Fluxo de Dados

```
1. Usuário grava áudio → AudioRecorder
2. Blob enviado para backend → POST /pacientes/:id/hma/audio/process
3. Backend transcreve com Whisper → OpenAI API
4. Backend extrai dados com GPT-4 → OpenAI API
5. Backend mescla dados com paciente existente → MongoDB
6. Frontend recebe paciente atualizado → Recarrega página
```

## 💰 Custos Estimados (OpenAI)

### Whisper (Transcrição)
- **$0.006 por minuto** de áudio
- Consulta de 5 minutos = **$0.03**

### GPT-4o-mini (Extração)
- **~$0.0001 por requisição** (prompt pequeno)

### Total por Consulta
- **~$0.03 - $0.05** por consulta completa

## 🐛 Troubleshooting

### Erro: "Module not found: openai"
```bash
cd backend
npm install openai --legacy-peer-deps
```

### Erro: "OPENAI_API_KEY not found"
- Verifique se o arquivo `.env` existe em `/backend`
- Copie de `.env.example` se necessário
- Reinicie o servidor backend

### Áudio não é processado
- Verifique se a gravação tem pelo menos 2 segundos
- Confirme que o formato é suportado (WebM, MP3, etc.)
- Veja os logs do backend para erros da OpenAI

### Dados não aparecem após processamento
- Aguarde o reload automático da página (1.5s)
- Verifique o console do navegador para erros
- Confirme que o paciente foi atualizado no MongoDB

## 📊 Logs e Monitoramento

### Backend Logs
```bash
🎙️ Processando áudio: /uploads/hma/audio/hma-123456.webm
✅ Transcrição completa
✅ Dados extraídos: { ... }
```

### Frontend Logs
```bash
✅ Dados extraídos: { dados_pessoais: {...}, dados_clinicos: {...} }
```

## 🔄 Próximas Melhorias

- [ ] Preenchimento em tempo real (streaming)
- [ ] Suporte a múltiplos idiomas
- [ ] Correção manual de dados extraídos antes de salvar
- [ ] Histórico de versões de transcrições
- [ ] Análise de sentimento e urgência
- [ ] Sugestões de CID-10 baseadas no diagnóstico
- [ ] Integração com prontuário eletrônico

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend e frontend
2. Consulte a documentação da OpenAI
3. Revise este documento

---

**Desenvolvido com ❤️ para TEOMED**
