# 🧠 Análise de Personalidade - Enneagrama

## 📋 Descrição

Sistema de análise automática de personalidade baseado no **Enneagrama**, desenvolvido para a Clínica de Cirurgia Bariátrica e Metabólica do Dr. José Luis Lopes Corrêa.

O sistema analisa mensagens dos pacientes (texto ou transcrição de áudio) e identifica o perfil de personalidade, sugerindo respostas personalizadas e empáticas.

---

## 🎯 Tipos de Personalidade (Enneagrama)

1. **Perfeccionista (Reformador):** Busca o certo, é ético, exigente
2. **Prestativo (Ajudador):** Empático, gosta de ajudar
3. **Realizador (Bem-sucedido):** Prático, competitivo, quer resultados
4. **Individualista (Sensível):** Emocional, autêntico
5. **Investigador (Analítico):** Racional, busca dados
6. **Leal (Cauteloso):** Inseguro, busca segurança
7. **Entusiasta (Otimista):** Alegre, curioso
8. **Desafiador (Líder):** Decidido, assertivo
9. **Pacificador (Mediador):** Tranquilo, busca harmonia

---

## 🚀 Como Usar

### **Endpoint:**
```
POST /pacientes/:id/personalidade/analisar
```

### **Headers:**
```
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### **Body:**
```json
{
  "texto": "Doutor, tenho medo da cirurgia, mas já tentei de tudo. Só quero fazer se for 100% segura."
}
```

### **Resposta:**
```json
{
  "pacienteId": "68d2c95859fc321f1b390eea",
  "pacienteNome": "João Santos",
  "tipo": "Tipo 6 – Leal (Cauteloso)",
  "justificativa": "O paciente expressa medo e necessidade de segurança antes de decidir.",
  "resposta": "Entendo totalmente sua preocupação. 😊 O Dr. José Luis e toda a equipe priorizam a segurança em cada etapa, e você terá acompanhamento completo antes e depois da cirurgia. Posso te ajudar a agendar uma conversa para explicar tudo com calma?",
  "timestamp": "2025-10-20T17:00:00.000Z"
}
```

---

## 📝 Exemplos de Uso

### **Exemplo 1: Paciente Cauteloso (Tipo 6)**

**Entrada:**
```
"Doutor, tenho medo da cirurgia, mas já tentei de tudo. Só quero fazer se for 100% segura."
```

**Saída:**
- **Tipo:** Tipo 6 – Leal (Cauteloso)
- **Justificativa:** Expressa medo e busca segurança
- **Resposta:** Foco em segurança, acompanhamento e confiança na equipe

---

### **Exemplo 2: Paciente Analítico (Tipo 5)**

**Entrada:**
```
"Gostaria de entender melhor o procedimento. Quais são as estatísticas de sucesso? Há estudos recentes?"
```

**Saída:**
- **Tipo:** Tipo 5 – Investigador (Analítico)
- **Justificativa:** Busca dados, estatísticas e informações detalhadas
- **Resposta:** Fornece dados técnicos, estudos e informações científicas

---

### **Exemplo 3: Paciente Otimista (Tipo 7)**

**Entrada:**
```
"Estou super animado! Quero fazer logo a cirurgia e começar uma vida nova! Vai ser incrível!"
```

**Saída:**
- **Tipo:** Tipo 7 – Entusiasta (Otimista)
- **Justificativa:** Demonstra entusiasmo e foco em experiências positivas
- **Resposta:** Reforça o entusiasmo, mas orienta sobre preparação e cuidados

---

## 🧪 Testar Localmente

### **1. Usando cURL:**

```bash
curl -X POST "http://localhost:3004/pacientes/68d2c95859fc321f1b390eea/personalidade/analisar" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "texto": "Doutor, tenho medo da cirurgia, mas já tentei de tudo."
  }'
```

### **2. Usando o Script de Teste:**

```bash
# Edite o script com seu token e ID do paciente
nano test-personalidade.sh

# Execute
./test-personalidade.sh
```

---

## 🔧 Integração com Frontend

### **Exemplo em React/TypeScript:**

```typescript
const analisarPersonalidade = async (texto: string) => {
  const token = localStorage.getItem('token')
  const pacienteId = '68d2c95859fc321f1b390eea'

  const response = await fetch(
    `http://localhost:3004/pacientes/${pacienteId}/personalidade/analisar`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ texto })
    }
  )

  const resultado = await response.json()
  console.log('Tipo:', resultado.tipo)
  console.log('Resposta sugerida:', resultado.resposta)
  
  return resultado
}
```

---

## ⚕️ Diretrizes Éticas

- ✅ Linguagem acolhedora, empática e humana
- ✅ Conforme normas do CFM e SBCBM
- ❌ Não promete resultados ou diagnósticos
- ✅ Prioriza clareza, credibilidade e segurança
- ✅ Reforça o papel da equipe médica

---

## 📚 Documentação da API

Acesse a documentação completa em:
```
http://localhost:3004/api
```

---

## 🎯 Casos de Uso

1. **Atendimento via WhatsApp**: Secretária analisa mensagens e adapta respostas
2. **Consulta Presencial**: Durante gravação de áudio, análise automática do perfil
3. **CRM**: Armazenar perfil de personalidade na ficha do paciente
4. **Treinamento**: Equipe aprende a identificar e lidar com diferentes perfis

---

## 🔐 Segurança

- Requer autenticação JWT
- Dados não são armazenados permanentemente (opcional)
- Análise processada em tempo real
- Conformidade com LGPD

---

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.
