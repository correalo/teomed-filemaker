import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExamesPreopService } from './exames_preop/exames-preop.service';
import { PacientesService } from './pacientes/pacientes.service';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const examesPreopService = app.get(ExamesPreopService);
  const pacientesService = app.get(PacientesService);

  try {
    // Buscar todos os pacientes
    const pacientes = await pacientesService.findAll();
    
    if (pacientes.pacientes.length === 0) {
      console.log('Nenhum paciente encontrado. Não é possível criar exames pré-operatórios.');
      await app.close();
      return;
    }

    // Criar um arquivo de exemplo para upload
    const exampleFilePath = path.join(__dirname, '../example-file.txt');
    fs.writeFileSync(exampleFilePath, 'Este é um arquivo de exemplo para o seed de exames pré-operatórios.');
    const fileBuffer = fs.readFileSync(exampleFilePath);
    const fileBase64 = fileBuffer.toString('base64');

    // Para cada paciente, criar exames pré-operatórios
    for (const paciente of pacientes.pacientes) {
      const pacienteId = (paciente as any)._id?.toString() || (paciente as any).id;
      const nomePaciente = paciente.nome;
      
      console.log(`Criando exames pré-operatórios para o paciente: ${nomePaciente} (ID: ${pacienteId})`);
      
      // Verificar se já existe um exame pré-operatório para este paciente
      const existingExamePreop = await examesPreopService.findByPacienteId(pacienteId);
      
      if (existingExamePreop) {
        console.log(`Exame pré-operatório já existe para o paciente ${nomePaciente}. Pulando...`);
        continue;
      }

      // Criar exame pré-operatório para o paciente
      const examePreop = await examesPreopService.create({
        paciente_id: pacienteId,
        nome_paciente: nomePaciente,
        data_cadastro: new Date(),
        status: 'pendente',
        observacoes_geral: 'Exame pré-operatório criado pelo seed.',
        data_cirurgia_prevista: new Date(new Date().setMonth(new Date().getMonth() + 1)) // 1 mês no futuro
      });

      console.log(`Exame pré-operatório criado para ${nomePaciente}`);

      // Adicionar arquivos de exemplo para cada campo
      const campos = ['exames', 'usg', 'eda', 'rx', 'ecg', 'eco', 'polissonografia', 'outros'];
      
      for (const campo of campos) {
        // Adicionar arquivo apenas para alguns campos aleatoriamente
        if (Math.random() > 0.5) {
          await examesPreopService.uploadFile(pacienteId, campo, {
            nome_arquivo: `exemplo-${campo}.txt`,
            arquivo_binario: fileBase64,
            mime_type: 'text/plain',
            observacoes: `Arquivo de exemplo para ${campo}`
          });
          console.log(`Arquivo adicionado ao campo ${campo} para o paciente ${nomePaciente}`);
        }
      }
    }

    // Remover o arquivo de exemplo
    fs.unlinkSync(exampleFilePath);

    console.log('Dados de exemplo de exames pré-operatórios criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
