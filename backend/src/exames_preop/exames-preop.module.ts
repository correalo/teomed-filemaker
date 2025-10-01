import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamesPreopService } from './exames-preop.service';
import { ExamesPreopController } from './exames-preop.controller';
import { ExamePreop, ExamePreopSchema } from './exame-preop.entity';
import { Paciente, PacienteSchema } from '../schemas/paciente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExamePreop.name, schema: ExamePreopSchema },
      { name: Paciente.name, schema: PacienteSchema }
    ])
  ],
  controllers: [ExamesPreopController],
  providers: [ExamesPreopService],
  exports: [ExamesPreopService]
})
export class ExamesPreopModule {}
