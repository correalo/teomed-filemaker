import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { EvolucoesService } from './evolucoes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('evolucoes')
@UseGuards(JwtAuthGuard)
export class EvolucoesController {
  constructor(private readonly evolucoesService: EvolucoesService) {}

  @Post()
  create(@Body() createEvolucaoDto: any) {
    return this.evolucoesService.create(createEvolucaoDto);
  }

  @Get('paciente/:pacienteId')
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.evolucoesService.findByPacienteId(pacienteId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvolucaoDto: any) {
    return this.evolucoesService.update(id, updateEvolucaoDto);
  }
}
