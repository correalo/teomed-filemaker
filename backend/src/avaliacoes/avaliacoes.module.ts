import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvaliacoesService } from './avaliacoes.service';
import { AvaliacoesController } from './avaliacoes.controller';
import { Avaliacao, AvaliacaoSchema } from './avaliacao.entity';
import { Paciente, PacienteSchema } from '../schemas/paciente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Avaliacao.name, schema: AvaliacaoSchema },
      { name: Paciente.name, schema: PacienteSchema }
    ]),
  ],
  controllers: [AvaliacoesController],
  providers: [AvaliacoesService],
  exports: [AvaliacoesService],
})
export class AvaliacoesModule {}
