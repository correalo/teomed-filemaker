import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamesService } from './exames.service';
import { ExamesController } from './exames.controller';
import { Exame, ExameSchema } from './exame.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exame.name, schema: ExameSchema }
    ])
  ],
  controllers: [ExamesController],
  providers: [ExamesService],
  exports: [ExamesService]
})
export class ExamesModule {}
