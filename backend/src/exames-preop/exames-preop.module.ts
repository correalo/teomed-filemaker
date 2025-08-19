import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamesPreopController } from './exames-preop.controller';
import { ExamesPreopService } from './exames-preop.service';
import { ExamePreop, ExamePreopSchema } from '../schemas/exame-preop.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExamePreop.name, schema: ExamePreopSchema },
    ]),
  ],
  controllers: [ExamesPreopController],
  providers: [ExamesPreopService],
  exports: [ExamesPreopService],
})
export class ExamesPreopModule {}
