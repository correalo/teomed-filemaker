import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceitasController } from './receitas.controller';
import { ReceitasService } from './receitas.service';
import { Receita, ReceitaSchema } from '../schemas/receita.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Receita.name, schema: ReceitaSchema },
    ]),
  ],
  controllers: [ReceitasController],
  providers: [ReceitasService],
  exports: [ReceitasService],
})
export class ReceitasModule {}
