# Resumo: Correções Necessárias em Exames Pré-Op

## Problema Relatado
Os locais de drag and drop dos exames pré-op não estão aceitando imagens e não as renderizam.

## Correções Já Aplicadas (Backend)

✅ Entity migrada para arrays
✅ Service atualizado para trabalhar com arrays  
✅ Controller atualizado com parâmetro nomeArquivo
✅ Backend reiniciado

## Correções Necessárias (Frontend)

### 1. Atualizar categorias de campos (linha 131)
```typescript
// Antes (campos antigos)
const categories = ['laboratoriais', 'usg', 'eda', 'colono', 'anatomia_patologica', 'tomografia', 'bioimpedancia', 'outros', 'outros2']

// Depois (campos corretos)
const categories = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros']
```

### 2. Atualizar useEffect para processar arrays (linhas 126-150)
```typescript
useEffect(() => {
  if (exameData) {
    console.log('PortalSection: Dados de exame recebidos:', exameData);
    const filesFromBackend: {[key: string]: File[]} = {}
    
    const categories = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros']
    categories.forEach(category => {
      const fieldData = exameData[category];
      // Verificar se o campo existe e é um array com arquivos
      if (fieldData && Array.isArray(fieldData) && fieldData.length > 0) {
        console.log(`PortalSection: Campo ${category} tem ${fieldData.length} arquivo(s)`);
        
        // Mapear cada arquivo do array
        filesFromBackend[category] = fieldData.map((arquivo: any) => {
          const mockFile = new File([''], arquivo.nome_original || arquivo.nome_arquivo || 'arquivo', { 
            type: arquivo.tipo || 'application/pdf'
          })
          
          Object.defineProperty(mockFile, 'size', { value: arquivo.tamanho || 0, writable: false })
          Object.defineProperty(mockFile, 'nome_arquivo', { value: arquivo.nome_arquivo, writable: false })
          Object.defineProperty(mockFile, 'nome_original', { value: arquivo.nome_original || arquivo.nome_arquivo, writable: false })
          Object.defineProperty(mockFile, 'data_upload', { value: arquivo.data_upload, writable: false })
          Object.defineProperty(mockFile, 'tipo', { value: arquivo.tipo, writable: false })
          
          return mockFile;
        });
      }
    })
    
    console.log('PortalSection: Arquivos processados:', Object.keys(filesFromBackend));
    setUploadedFiles(prev => activeTab === 'exames' || activeTab === 'exames_preop' ? filesFromBackend : prev)
  }
}, [exameData, activeTab])
```

### 3. Atualizar accept do input para aceitar imagens (buscar por input.accept)
```typescript
input.accept = 'image/*,.pdf,.heic,.heif'  // Em vez de '.pdf,.heic,.jpeg,.jpg,.png'
```

### 4. Atualizar descrição dos arquivos aceitos
```typescript
PDF, Imagens (JPEG, PNG, HEIC, etc.) - máx. 50MB
```

### 5. Atualizar detecção de tipo de arquivo para ícone
```typescript
{((file as any).tipo || file.type || '').includes('pdf') ? (
  // ícone PDF
) : (
  // ícone imagem
)}
```

### 6. Atualizar removeFile para usar nome correto
```typescript
const nomeArquivo = (file as any).nome_arquivo || file.name;
```

## Status

- ✅ Backend: Completo e funcionando
- ⚠️ Frontend: Arquivo foi restaurado pelo git, precisa reaplicar mudanças
- ⚠️ Aceitar imagens: Pendente
- ⚠️ Renderizar imagens: Modal já está preparado, só falta aceitar upload

## Próximos Passos

1. Reaplicar mudanças do useEffect para processar arrays
2. Atualizar input.accept para 'image/*,.pdf,.heic,.heif'
3. Atualizar descrição dos arquivos aceitos
4. Testar upload de imagens
5. Testar visualização de imagens no modal
