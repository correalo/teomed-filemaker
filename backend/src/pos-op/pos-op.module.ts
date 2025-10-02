import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PosOpController } from './pos-op.controller';
import { PosOpService } from './pos-op.service';
import { PosOp, PosOpSchema } from './pos-op.entity';
import { Paciente, PacienteSchema } from '../schemas/paciente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PosOp.name, schema: PosOpSchema },
      { name: Paciente.name, schema: PacienteSchema },
    ]),
  ],
  controllers: [PosOpController],
  providers: [PosOpService],
  exports: [PosOpService],
})
export class PosOpModule {}
