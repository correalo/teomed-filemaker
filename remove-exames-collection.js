/**
 * Script para remover a coleção 'exames' antiga do MongoDB
 * 
 * ATENÇÃO: Este script irá deletar permanentemente a coleção 'exames'
 * e todos os seus dados. Use com cuidado!
 * 
 * Para executar:
 * mongosh pacientes_db remove-exames-collection.js
 * 
 * Ou manualmente no mongosh:
 * use pacientes_db
 * db.exames.drop()
 */

// Conectar ao banco de dados
const db = db.getSiblingDB('pacientes_db');

console.log('='.repeat(60));
console.log('REMOÇÃO DA COLEÇÃO ANTIGA "exames"');
console.log('='.repeat(60));

// Verificar se a coleção existe
const collections = db.getCollectionNames();
if (!collections.includes('exames')) {
  console.log('✅ A coleção "exames" não existe. Nada a fazer.');
  quit(0);
}

// Contar documentos antes de deletar
const count = db.exames.countDocuments();
console.log(`\n📊 Documentos encontrados na coleção "exames": ${count}`);

if (count > 0) {
  console.log('\n⚠️  ATENÇÃO: A coleção contém dados!');
  console.log('   Se você deseja fazer backup antes de deletar, cancele agora (Ctrl+C)');
  console.log('   e execute: mongoexport --db=pacientes_db --collection=exames --out=exames_backup.json');
  console.log('\n   Aguardando 5 segundos antes de continuar...');
  
  // Aguardar 5 segundos
  sleep(5000);
}

// Deletar a coleção
console.log('\n🗑️  Removendo coleção "exames"...');
const result = db.exames.drop();

if (result) {
  console.log('✅ Coleção "exames" removida com sucesso!');
  console.log('\n📝 Resumo:');
  console.log(`   - Documentos deletados: ${count}`);
  console.log('   - Coleção removida: exames');
  console.log('\n✅ A coleção "exames_preop" permanece intacta.');
} else {
  console.log('❌ Erro ao remover a coleção "exames"');
  quit(1);
}

console.log('\n' + '='.repeat(60));
console.log('OPERAÇÃO CONCLUÍDA');
console.log('='.repeat(60));
