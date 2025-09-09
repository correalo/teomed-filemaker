import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EvolucoesService } from './evolucoes/evolucoes.service';
import { PacientesService } from './pacientes/pacientes.service';
import { CreateEvolucaoDto } from './evolucoes/dto/create-evolucao.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const evolucoesService = app.get(EvolucoesService);
  const pacientesService = app.get(PacientesService);

  try {
    // Buscar todos os pacientes
    const pacientes = await pacientesService.findAll();
    
    if (pacientes.pacientes.length === 0) {
      console.log('Nenhum paciente encontrado. Não é possível criar evoluções.');
      await app.close();
      return;
    }

    // Para cada paciente, criar algumas evoluções
    for (const paciente of pacientes.pacientes) {
      const pacienteId = (paciente as any)._id?.toString() || (paciente as any).id;
      const nomePaciente = paciente.nome;
      
      console.log(`Criando evoluções para o paciente: ${nomePaciente} (ID: ${pacienteId})`);
      
      // Criar 3 evoluções para cada paciente com datas diferentes
      const dataAtual = new Date();
      
      // Primeira evolução (3 meses atrás)
      const data1 = new Date(dataAtual);
      data1.setMonth(data1.getMonth() - 3);
      
      // Segunda evolução (2 meses atrás)
      const data2 = new Date(dataAtual);
      data2.setMonth(data2.getMonth() - 2);
      
      // Terceira evolução (1 mês atrás)
      const data3 = new Date(dataAtual);
      data3.setMonth(data3.getMonth() - 1);
      
      const evolucoes: CreateEvolucaoDto[] = [
        {
          paciente_id: pacienteId,
          nome_paciente: nomePaciente,
          data_retorno: data1,
          delta_t: '3 meses',
          peso: Math.floor(70 + Math.random() * 30), // Peso entre 70 e 100 kg
          delta_peso: -Math.floor(Math.random() * 5), // Perda de peso entre 0 e 5 kg
          exames_alterados: 'Hemograma, Glicemia',
          medicacoes: ['Metformina 500mg', 'Omeprazol 20mg']
        },
        {
          paciente_id: pacienteId,
          nome_paciente: nomePaciente,
          data_retorno: data2,
          delta_t: '2 meses',
          peso: Math.floor(65 + Math.random() * 30), // Peso entre 65 e 95 kg
          delta_peso: -Math.floor(Math.random() * 3), // Perda de peso entre 0 e 3 kg
          exames_alterados: 'Glicemia',
          medicacoes: ['Metformina 500mg', 'Omeprazol 20mg', 'Vitamina B12']
        },
        {
          paciente_id: pacienteId,
          nome_paciente: nomePaciente,
          data_retorno: data3,
          delta_t: '1 mês',
          peso: Math.floor(60 + Math.random() * 30), // Peso entre 60 e 90 kg
          delta_peso: -Math.floor(Math.random() * 2), // Perda de peso entre 0 e 2 kg
          exames_alterados: 'Nenhum',
          medicacoes: ['Vitamina B12', 'Suplemento proteico']
        }
      ];
      
      // Salvar as evoluções no banco de dados
      for (const evolucao of evolucoes) {
        await evolucoesService.create(evolucao);
        console.log(`Evolução criada para ${nomePaciente} em ${evolucao.data_retorno}`);
      }
    }

    console.log('Dados de exemplo de evoluções criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
