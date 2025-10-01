# Remoção da Coleção `exames` Antiga

## ✅ Concluído

A coleção `exames` antiga foi removida do código backend. Apenas `exames_preop` permanece em uso.

## O que foi feito

### 1. Backend - Código Removido ✅

**Arquivo:** `/backend/src/app.module.ts`
- ❌ Removido: `import { ExamesModule } from './exames/exames.module';`
- ❌ Removido: `ExamesModule` da lista de imports

**Pasta deletada:** `/backend/src/exames/`
- ❌ exames.controller.ts
- ❌ exames.service.ts
- ❌ exames.module.ts
- ❌ exame.entity.ts
- ❌ dto/create-exame.dto.ts
- ❌ dto/update-exame.dto.ts

### 2. Banco de Dados - Próximo Passo ⚠️

A coleção `exames` ainda existe no MongoDB e precisa ser removida manualmente.

## Como Remover a Coleção do MongoDB

### Opção 1: Script Automatizado (Recomendado)

```bash
cd /Volumes/JOSEPH/teomed-filemaker
mongosh pacientes_db remove-exames-collection.js
```

O script irá:
1. Verificar se a coleção existe
2. Contar quantos documentos existem
3. Aguardar 5 segundos (tempo para cancelar se necessário)
4. Deletar a coleção
5. Mostrar resumo da operação

### Opção 2: MongoDB Compass (Interface Gráfica)

1. Abrir MongoDB Compass
2. Conectar em `mongodb://localhost:27017`
3. Selecionar database `pacientes_db`
4. Encontrar coleção `exames`
5. Clicar com botão direito → "Drop Collection"
6. Confirmar a remoção

### Opção 3: mongosh (Linha de Comando)

```bash
mongosh
```

Depois execute:
```javascript
use pacientes_db
db.exames.countDocuments()  // Ver quantos documentos existem
db.exames.drop()             // Deletar a coleção
```

## Backup (Opcional)

Se desejar fazer backup antes de deletar:

```bash
mongoexport --db=pacientes_db --collection=exames --out=exames_backup_$(date +%Y%m%d).json
```

Isso criará um arquivo JSON com todos os dados da coleção.

## Verificação

Após remover a coleção, verifique que foi removida:

```bash
mongosh pacientes_db --eval "db.getCollectionNames()"
```

A lista NÃO deve incluir `exames`, apenas:
- ✅ avaliacoes
- ✅ evolucoes
- ✅ exames_preop
- ✅ pacientes
- ✅ receitas
- ✅ relatorio_preop
- ✅ users

## Resultado Final

### Antes
```
Coleções no MongoDB:
├── avaliacoes
├── evolucoes
├── exames          ← Antiga (duplicada)
├── exames_preop    ← Nova (em uso)
├── pacientes
└── receitas

Módulos no Backend:
├── ExamesModule        ← Antiga (duplicado)
├── ExamesPreopModule   ← Nova (em uso)
```

### Depois
```
Coleções no MongoDB:
├── avaliacoes
├── evolucoes
├── exames_preop    ← Única coleção de exames
├── pacientes
└── receitas

Módulos no Backend:
├── ExamesPreopModule   ← Único módulo de exames
```

## Benefícios

✅ **Código mais limpo** - Sem duplicação de módulos  
✅ **Menos confusão** - Apenas uma coleção de exames  
✅ **Manutenção simplificada** - Um único ponto de verdade  
✅ **Performance** - Menos coleções no banco  

## Arquivos Criados

1. **remove-exames-collection.js** - Script para remover coleção do MongoDB
2. **ANALISE_COLECOES_EXAMES.md** - Análise completa das duas coleções
3. **REMOCAO_COLECAO_EXAMES.md** - Este arquivo (resumo da remoção)

## Próximos Passos

1. ⚠️ **Executar script para remover coleção do MongoDB**
2. 🔄 **Reiniciar o backend** (`npm run start:dev`)
3. ✅ **Testar upload de exames pré-operatórios**
4. ✅ **Verificar que tudo funciona normalmente**

---

**Data da remoção:** 2025-09-30  
**Coleção removida:** `exames` (antiga)  
**Coleção mantida:** `exames_preop` (atual)
