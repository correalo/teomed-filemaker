import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvaliacoesController } from './avaliacoes.controller';
import { AvaliacoesService } from './avaliacoes.service';
import { Avaliacao, AvaliacaoSchema } from '../schemas/avaliacao.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Avaliacao.name, schema: AvaliacaoSchema },
    ]),
  ],
  controllers: [AvaliacoesController],
  providers: [AvaliacoesService],
  exports: [AvaliacoesService],
})
export class AvaliacoesModule {}
