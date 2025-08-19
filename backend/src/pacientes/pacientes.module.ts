import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { Paciente, PacienteSchema } from '../schemas/paciente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Paciente.name, schema: PacienteSchema },
    ]),
  ],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService],
})
export class PacientesModule {}
