import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ReceitasService } from './receitas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('receitas')
@UseGuards(JwtAuthGuard)
export class ReceitasController {
  constructor(private readonly receitasService: ReceitasService) {}

  @Post()
  create(@Body() createReceitaDto: any) {
    return this.receitasService.create(createReceitaDto);
  }

  @Get('paciente/:pacienteId')
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.receitasService.findByPacienteId(pacienteId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReceitaDto: any) {
    return this.receitasService.update(id, updateReceitaDto);
  }
}
