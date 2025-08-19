import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('avaliacoes')
@UseGuards(JwtAuthGuard)
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  create(@Body() createAvaliacaoDto: any) {
    return this.avaliacoesService.create(createAvaliacaoDto);
  }

  @Get('paciente/:pacienteId')
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.avaliacoesService.findByPacienteId(pacienteId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAvaliacaoDto: any) {
    return this.avaliacoesService.update(id, updateAvaliacaoDto);
  }
}
