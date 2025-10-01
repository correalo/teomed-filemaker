# Análise: Duas Coleções de Exames

## Situação Atual

O sistema TEOMED possui **duas coleções diferentes** para exames pré-operatórios:

### 1. Coleção `exames` (Antiga)

**Localização:** `/backend/src/exames/`

**Estrutura:**
```javascript
{
  _id: ObjectId,
  paciente_id: String,
  nome_paciente: String,
  data_criacao: Date,
  data_atualizacao: Date,
  laboratoriais: Array,  // ⚠️ Array de arquivos
  usg: Array,
  eda: Array,
  colono: Array,
  anatomia_patologica: Array,
  tomografia: Array,
  bioimpedancia: Array,
  outros: Array,
  outros2: Array
}
```

**Características:**
- ✅ Permite **múltiplos arquivos** por campo (Array)
- ✅ Tem campo `nome_paciente`
- ⚠️ Nomes de campos confusos (`colono`, `anatomia_patologica`, `bioimpedancia`)
- ⚠️ Campos extras não usados (`outros2`)

### 2. Coleção `exames_preop` (Nova/Atual)

**Localização:** `/backend/src/exames_preop/`

**Estrutura:**
```javascript
{
  _id: ObjectId,
  paciente_id: String,
  nome_paciente: String,  // ✅ Adicionado recentemente
  data_cadastro: Date,
  status: String,
  observacoes_geral: String,
  exames: Object,  // ⚠️ Objeto único (não array)
  usg: Object,
  eda: Object,
  rx: Object,
  ecg: Object,
  eco: Object,
  polissonografia: Object,
  outros: Object
}
```

**Características:**
- ⚠️ Permite **apenas 1 arquivo** por campo (Object)
- ✅ Tem campo `nome_paciente` (adicionado recentemente)
- ✅ Nomes de campos mais claros (`rx`, `ecg`, `eco`)
- ✅ Campos adicionais úteis (`status`, `observacoes_geral`, `data_cirurgia_prevista`)

## Comparação

| Aspecto | `exames` (antiga) | `exames_preop` (nova) |
|---------|-------------------|----------------------|
| **Múltiplos arquivos** | ✅ Sim (Array) | ❌ Não (Object único) |
| **Nome do paciente** | ✅ Sim | ✅ Sim |
| **Nomes de campos** | ⚠️ Confusos | ✅ Claros |
| **Campos extras** | ❌ `outros2` não usado | ✅ `status`, `observacoes_geral` |
| **Estrutura de arquivo** | Array de objetos | Objeto único |
| **Em uso no frontend** | ❌ Não | ✅ Sim |

## Módulos Ativos

Ambos os módulos estão registrados no `app.module.ts`:

```typescript
imports: [
  // ...
  ExamesModule,        // ← Coleção 'exames'
  ExamesPreopModule,   // ← Coleção 'exames_preop'
]
```

## Uso no Frontend

O frontend (`PortalSection.tsx`) atualmente usa **apenas `exames_preop`**:

```typescript
// Tab "Exames Pré-Op" usa a API de exames-preop
const response = await fetch(`/api/exames-preop/paciente/${pacienteId}`)
```

## Recomendações

### Opção 1: Manter `exames_preop` (Recomendado)

**Prós:**
- ✅ Já está em uso no frontend
- ✅ Nomes de campos mais claros
- ✅ Estrutura mais organizada
- ✅ Campos adicionais úteis

**Contras:**
- ❌ Permite apenas 1 arquivo por campo
- ⚠️ Precisa migrar dados existentes de `exames` se houver

**Ações necessárias:**
1. Verificar se há dados na coleção `exames`
2. Se houver, criar script de migração
3. Depreciar e remover módulo `ExamesModule`
4. Remover pasta `/backend/src/exames/`

### Opção 2: Migrar para `exames` (Não recomendado)

**Prós:**
- ✅ Permite múltiplos arquivos por campo

**Contras:**
- ❌ Nomes de campos confusos
- ❌ Precisa atualizar todo o frontend
- ❌ Estrutura menos organizada

### Opção 3: Manter Ambas (Não recomendado)

**Contras:**
- ❌ Confusão sobre qual usar
- ❌ Duplicação de código
- ❌ Manutenção mais complexa
- ❌ Risco de inconsistência

## Decisão Recomendada

**Manter apenas `exames_preop` e remover `exames`**

### Plano de Ação

1. **Verificar dados existentes:**
   ```javascript
   // No MongoDB
   db.exames.countDocuments()
   ```

2. **Se houver dados, criar migração:**
   - Migrar dados de `exames` para `exames_preop`
   - Considerar que `exames_preop` aceita apenas 1 arquivo por campo
   - Decidir como tratar múltiplos arquivos (manter o mais recente?)

3. **Remover módulo antigo:**
   - Remover `ExamesModule` do `app.module.ts`
   - Deletar pasta `/backend/src/exames/`
   - Atualizar documentação

4. **Se necessário múltiplos arquivos:**
   - Considerar modificar `exames_preop` para aceitar arrays
   - Ou criar campos adicionais (`exames_2`, `exames_3`, etc.)

## Status Atual

- ✅ Frontend usa `exames_preop`
- ✅ `exames_preop` tem `nome_paciente`
- ⚠️ Módulo `exames` ainda ativo mas não usado
- ⚠️ Possível confusão entre as duas coleções

## ✅ AÇÃO TOMADA - Remoção da Coleção `exames`

### Decisão Final
**Removida a coleção `exames` antiga e mantida apenas `exames_preop`**

### Alterações Realizadas

1. **Backend - app.module.ts**
   - ✅ Removido import de `ExamesModule`
   - ✅ Removido `ExamesModule` da lista de imports

2. **Backend - Código**
   - ✅ Deletada pasta `/backend/src/exames/` completa
   - ✅ Removidos todos os arquivos:
     - exames.controller.ts
     - exames.service.ts
     - exames.module.ts
     - exame.entity.ts
     - DTOs (create-exame.dto.ts, update-exame.dto.ts)

3. **Banco de Dados**
   - ⚠️ Coleção `exames` ainda existe no MongoDB
   - 📄 Script criado: `remove-exames-collection.js`

### Como Remover a Coleção do MongoDB

**Opção 1: Usando o script (Recomendado)**
```bash
mongosh pacientes_db remove-exames-collection.js
```

**Opção 2: Manualmente no MongoDB Compass**
1. Abrir MongoDB Compass
2. Conectar em `localhost:27017`
3. Selecionar database `pacientes_db`
4. Clicar na coleção `exames`
5. Clicar em "Drop Collection"

**Opção 3: Via mongosh**
```javascript
use pacientes_db
db.exames.drop()
```

### Backup (Opcional)

Se desejar fazer backup antes de deletar:
```bash
mongoexport --db=pacientes_db --collection=exames --out=exames_backup.json
```

### Resultado

✅ **Módulo backend removido**  
✅ **Código limpo e sem duplicação**  
✅ **Apenas `exames_preop` em uso**  
⚠️ **Coleção MongoDB ainda existe** (execute script para remover)

### Próximos Passos

1. Executar script `remove-exames-collection.js` para deletar coleção do MongoDB
2. Reiniciar o backend para garantir que tudo funciona
3. Testar upload de exames pré-operatórios
