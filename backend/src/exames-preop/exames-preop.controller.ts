import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ExamesPreopService } from './exames-preop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exames-preop')
@UseGuards(JwtAuthGuard)
export class ExamesPreopController {
  constructor(private readonly examesPreopService: ExamesPreopService) {}

  @Post()
  create(@Body() createExamePreopDto: any) {
    return this.examesPreopService.create(createExamePreopDto);
  }

  @Get('paciente/:pacienteId')
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.examesPreopService.findByPacienteId(pacienteId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamePreopDto: any) {
    return this.examesPreopService.update(id, updateExamePreopDto);
  }
}
