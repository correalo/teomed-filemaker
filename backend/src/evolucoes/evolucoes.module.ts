import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvolucoesController } from './evolucoes.controller';
import { EvolucoesService } from './evolucoes.service';
import { Evolucao, EvolucaoSchema } from '../schemas/evolucao.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evolucao.name, schema: EvolucaoSchema },
    ]),
  ],
  controllers: [EvolucoesController],
  providers: [EvolucoesService],
  exports: [EvolucoesService],
})
export class EvolucoesModule {}
