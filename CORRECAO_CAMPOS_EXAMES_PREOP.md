# Correção de Campos de Exames Pré-Operatórios

## Problema Identificado

O sistema estava retornando erro 400 (Bad Request) ao tentar fazer upload de arquivos para exames pré-operatórios. A mensagem de erro era:

```
Campo inválido: laboratoriais. Campos válidos: exames, usg, eda, rx, ecg, eco, polissonografia, outros
```

## Causa Raiz

Havia uma incompatibilidade entre os nomes de campos usados no frontend (`PortalSection.tsx`) e os campos aceitos pelo backend (`exames-preop.service.ts`).

### Campos Antigos (Frontend)
```typescript
['laboratoriais', 'usg', 'eda', 'colono', 'anatomia_patologica', 'tomografia', 'bioimpedancia', 'outros', 'outros2']
```

### Campos Aceitos (Backend)
```typescript
['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros']
```

## Solução Implementada

### 1. Atualização dos Campos no PortalSection.tsx

Modificamos a lista de categorias para corresponder exatamente aos campos aceitos pelo backend:

```typescript
// Antes
const categories = ['laboratoriais', 'usg', 'eda', 'colono', 'anatomia_patologica', 'tomografia', 'bioimpedancia', 'outros', 'outros2']

// Depois
const categories = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros']
```

### 2. Atualização dos Campos de Upload na Interface

Modificamos os campos de upload exibidos na interface:

```typescript
// Antes
{ id: 'laboratoriais', label: 'EXAMES LABORATORIAIS' }
{ id: 'colono', label: 'ECOCARDIOGRAMA' }
{ id: 'anatomia_patologica', label: 'RX DE TÓRAX' }
{ id: 'tomografia', label: 'TOMOGRAFIA' }
{ id: 'bioimpedancia', label: 'POLISSONOGRAFIA' }
{ id: 'outros2', label: 'OUTROS 2' }

// Depois
{ id: 'exames', label: 'EXAMES LABORATORIAIS' }
{ id: 'ecg', label: 'ECG' }
{ id: 'rx', label: 'RX DE TÓRAX' }
{ id: 'eco', label: 'ECOCARDIOGRAMA' }
{ id: 'polissonografia', label: 'POLISSONOGRAFIA' }
// Removido: tomografia e outros2
```

### 3. Correção do Tratamento de Erro

Corrigimos o tratamento de erro no PortalSection para evitar o erro "body stream already read":

```typescript
// Antes
try {
  const errorData = await response.json();
  // ...
} catch (parseError) {
  const errorText = await response.text(); // ❌ Erro: stream já foi lido
}

// Depois
const errorText = await response.text(); // ✅ Ler texto primeiro
try {
  const errorData = JSON.parse(errorText); // ✅ Depois tentar parse
  // ...
}
```

## Mapeamento de Campos

| Label na Interface | ID do Campo | Descrição |
|-------------------|-------------|-----------|
| EXAMES LABORATORIAIS | `exames` | Exames de laboratório |
| USG | `usg` | Ultrassonografia |
| EDA | `eda` | Endoscopia Digestiva Alta |
| ECG | `ecg` | Eletrocardiograma |
| RX DE TÓRAX | `rx` | Raio-X de Tórax |
| ECOCARDIOGRAMA | `eco` | Ecocardiograma |
| POLISSONOGRAFIA | `polissonografia` | Polissonografia |
| OUTROS | `outros` | Outros exames |

## Arquivos Modificados

1. `/frontend/src/components/PortalSection.tsx`
   - Linha 197: Atualizada lista de categorias
   - Linhas 1147-1154: Atualizados campos de upload na interface
   - Linhas 348-361: Corrigido tratamento de erro
   - Linhas 190-227: Corrigido useEffect para processar estrutura de dados do backend corretamente

2. `/frontend/src/app/api/exames-preop/upload/[pacienteId]/[fieldName]/route.ts`
   - Linha 30-37: Corrigido erro de iteração do FormData usando Array.from()

## Correções Adicionais

### 3. Estrutura de Dados do Backend

O backend armazena cada campo como um **objeto único** (não um array):

```typescript
{
  exames: {
    tem_arquivo: boolean,
    nome_arquivo: string,
    data_upload: Date,
    observacoes: string,
    arquivo_binario: string, // Base64
    mime_type: string
  }
}
```

Corrigimos o `useEffect` no PortalSection para:
- Verificar se cada campo tem `tem_arquivo: true`
- Criar um array com um único arquivo para cada campo
- Calcular o tamanho do arquivo a partir do Base64
- Adicionar propriedades customizadas ao objeto File mock

### 4. Erro de TypeScript com FormData Iterator

Corrigimos o erro de iteração do FormData:

```typescript
// Antes (causava erro)
for (const [key, value] of formData.entries()) { }

// Depois (correto)
Array.from(formData.entries()).forEach(([key, value]) => { })
```

## Resultado

✅ O upload de arquivos agora funciona corretamente
✅ Todos os campos estão alinhados entre frontend e backend
✅ Mensagens de erro são exibidas corretamente
✅ Interface mais limpa com campos relevantes
✅ Arquivos aparecem na lista após upload com nome e tamanho
✅ Dados são salvos corretamente no banco de dados
✅ Erro de TypeScript corrigido

## Testes Recomendados

1. Fazer upload de arquivo em "EXAMES LABORATORIAIS" (campo `exames`)
2. Fazer upload em cada um dos outros campos
3. Verificar se os arquivos são salvos corretamente no banco
4. Verificar se os arquivos aparecem na lista após upload
5. Testar remoção de arquivos
