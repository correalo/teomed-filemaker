import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvolucoesService } from './evolucoes.service';
import { EvolucoesController } from './evolucoes.controller';
import { Evolucao, EvolucaoSchema } from './evolucao.entity';
import { Paciente, PacienteSchema } from '../schemas/paciente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evolucao.name, schema: EvolucaoSchema },
      { name: Paciente.name, schema: PacienteSchema }
    ]),
  ],
  controllers: [EvolucoesController],
  providers: [EvolucoesService],
  exports: [EvolucoesService],
})
export class EvolucoesModule {}
