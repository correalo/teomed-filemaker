#!/bin/bash

# Script de teste para análise de personalidade
# Substitua PACIENTE_ID e TOKEN pelos valores reais

PACIENTE_ID="68d2c95859fc321f1b390eea"
TOKEN="seu_token_aqui"

echo "🧠 Testando Análise de Personalidade..."
echo ""

# Exemplo 1: Tipo 6 - Leal (Cauteloso)
echo "📝 Exemplo 1: Paciente Cauteloso"
curl -X POST "http://localhost:3004/pacientes/$PACIENTE_ID/personalidade/analisar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "texto": "Doutor, tenho medo da cirurgia, mas já tentei de tudo. Só quero fazer se for 100% segura. Preciso ter certeza de que não vai dar errado."
  }' | jq .

echo ""
echo "---"
echo ""

# Exemplo 2: Tipo 5 - Investigador (Analítico)
echo "📝 Exemplo 2: Paciente Analítico"
curl -X POST "http://localhost:3004/pacientes/$PACIENTE_ID/personalidade/analisar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "texto": "Gostaria de entender melhor o procedimento. Quais são as estatísticas de sucesso? Há estudos recentes sobre os resultados a longo prazo?"
  }' | jq .

echo ""
echo "---"
echo ""

# Exemplo 3: Tipo 7 - Entusiasta (Otimista)
echo "📝 Exemplo 3: Paciente Otimista"
curl -X POST "http://localhost:3004/pacientes/$PACIENTE_ID/personalidade/analisar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "texto": "Estou super animado! Quero fazer logo a cirurgia e começar uma vida nova! Vai ser incrível poder fazer tudo que eu sempre quis!"
  }' | jq .

echo ""
echo "✅ Testes concluídos!"
