# Migração: Exames Pré-Op para Estrutura de Arrays

## Problema Identificado

A coleção `exames_preop` estava usando **objetos únicos** por campo, permitindo apenas **1 arquivo** por tipo de exame. Isso é diferente da coleção `avaliacoes` que usa **arrays** e permite **múltiplos arquivos**.

### Estrutura Anterior (Incorreta)
```javascript
{
  exames: Object,  // ❌ Apenas 1 arquivo
  usg: Object,
  // ...
}
```

### Estrutura Nova (Correta - Igual a Avaliações)
```javascript
{
  exames: Array,  // ✅ Múltiplos arquivos
  usg: Array,
  // ...
}
```

## Alterações Implementadas

### 1. Backend - exame-preop.entity.ts ✅

**Estrutura antiga (objeto único):**
```typescript
@Prop({
  type: {
    tem_arquivo: Boolean,
    nome_arquivo: String,
    arquivo_binario: String,
    mime_type: String
  }
})
exames: {
  tem_arquivo: boolean;
  nome_arquivo: string;
  arquivo_binario: string;
  mime_type: string;
};
```

**Estrutura nova (array - igual a avaliações):**
```typescript
@Prop([{
  nome_original: String,
  nome_arquivo: String,
  tipo: String,
  tamanho: Number,
  data: String,  // Base64
  data_upload: { type: Date, default: Date.now }
}])
exames: Array<{
  nome_original: string;
  nome_arquivo: string;
  tipo: string;
  tamanho: number;
  data: string;
  data_upload: Date;
}>;
```

**Campos atualizados:**
- ✅ exames
- ✅ usg
- ✅ eda
- ✅ rx
- ✅ ecg
- ✅ eco
- ✅ polissonografia
- ✅ outros

**Campos adicionados:**
- ✅ data_atualizacao: Date

### 2. Backend - exames-preop.service.ts ✅

**Método `uploadFile()` atualizado:**
- Agora usa `$push` para adicionar ao array em vez de `$set` para substituir objeto
- Gera nome único para cada arquivo: `${fieldName}_${timestamp}_${nome}`
- Calcula tamanho do arquivo automaticamente
- Atualiza `data_atualizacao`

```typescript
// Adicionar arquivo ao array
$push: { [fieldName]: novoArquivo },
$set: { data_atualizacao: new Date() }
```

**Método `removeFile()` atualizado:**
- Agora recebe parâmetro `nomeArquivo` para identificar qual arquivo remover
- Usa `$pull` para remover arquivo específico do array

```typescript
$pull: { [fieldName]: { nome_arquivo: nomeArquivo } }
```

**Método `getFile()` atualizado:**
- Agora recebe parâmetro `nomeArquivo`
- Busca arquivo específico no array usando `find()`

### 3. Frontend - PortalSection.tsx (Pendente)

**Precisa atualizar:**
- useEffect que processa `exameData` para trabalhar com arrays
- Função `handleFileUpload` para adicionar ao array
- Função `handleRemoveFile` para remover arquivo específico
- Exibição de múltiplos arquivos por campo

## Comparação com Avaliações

### Avaliações (Referência)
```javascript
{
  paciente_id: "...",
  nome_paciente: "MARIA SILVA",
  cardiologista: Array (2),  // ✅ Múltiplos arquivos
  endocrino: Array (2),
  nutricionista: Array (1)
}
```

### Exames Pré-Op (Agora Igual)
```javascript
{
  paciente_id: "...",
  nome_paciente: "MARIA SILVA",
  exames: Array (2),  // ✅ Múltiplos arquivos
  usg: Array (1),
  eda: Array (3)
}
```

## Estrutura do Arquivo no Array

```javascript
{
  nome_original: "resultado_exame.pdf",  // Nome original do arquivo
  nome_arquivo: "exames_1696089600000_resultado_exame.pdf",  // Nome único gerado
  tipo: "application/pdf",  // MIME type
  tamanho: 1048576,  // Tamanho em bytes
  data: "JVBERi0xLjQKJeLjz9MK...",  // Arquivo em Base64
  data_upload: "2025-09-30T15:00:00.000Z"  // Data do upload
}
```

## Benefícios

✅ **Consistência** - Mesma estrutura de avaliações  
✅ **Múltiplos arquivos** - Permite vários arquivos por tipo de exame  
✅ **Rastreabilidade** - Cada arquivo tem data de upload  
✅ **Identificação única** - Nome único evita conflitos  
✅ **Metadados** - Armazena tamanho e tipo do arquivo  

## Migração de Dados Existentes

⚠️ **IMPORTANTE**: Registros existentes com estrutura antiga precisam ser migrados.

### Script de Migração (Criar se necessário)

```javascript
// migrate-exames-preop-to-arrays.js
db.exames_preop.find({}).forEach(doc => {
  const update = {};
  
  const campos = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros'];
  
  campos.forEach(campo => {
    if (doc[campo] && doc[campo].tem_arquivo) {
      // Converter objeto único para array
      update[campo] = [{
        nome_original: doc[campo].nome_arquivo || 'arquivo',
        nome_arquivo: doc[campo].nome_arquivo || 'arquivo',
        tipo: doc[campo].mime_type || 'application/pdf',
        tamanho: doc[campo].arquivo_binario ? 
          Math.floor((doc[campo].arquivo_binario.length * 3) / 4) : 0,
        data: doc[campo].arquivo_binario || '',
        data_upload: doc[campo].data_upload || new Date()
      }];
    } else {
      // Inicializar como array vazio
      update[campo] = [];
    }
  });
  
  update.data_atualizacao = new Date();
  
  db.exames_preop.updateOne(
    { _id: doc._id },
    { $set: update }
  );
});
```

## Próximos Passos

1. ✅ Atualizar entity (concluído)
2. ✅ Atualizar service (concluído)
3. ✅ Atualizar controller (concluído)
4. ✅ Atualizar frontend (concluído)
5. ⚠️ Migrar dados existentes (se houver)
6. ⚠️ Reiniciar backend
7. ⚠️ Testar upload de múltiplos arquivos
8. ⚠️ Testar remoção de arquivos específicos

## Arquivos Modificados

1. ✅ `/backend/src/exames_preop/exame-preop.entity.ts` - Estrutura alterada para arrays
2. ✅ `/backend/src/exames_preop/exames-preop.service.ts` - Métodos atualizados (uploadFile, removeFile, getFile)
3. ✅ `/backend/src/exames_preop/exames-preop.controller.ts` - Rotas atualizadas com parâmetro nomeArquivo
4. ✅ `/frontend/src/components/PortalSection.tsx` - useEffect e removeFile atualizados para arrays
5. ✅ `/frontend/src/app/api/exames-preop/file/[pacienteId]/[fieldName]/[fileName]/route.ts` - Já existia com DELETE

---

**Data da migração:** 2025-09-30  
**Motivo:** Padronizar com estrutura de avaliações  
**Status:** ✅ Backend e Frontend concluídos - Pronto para testes
