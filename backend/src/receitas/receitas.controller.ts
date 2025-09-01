import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ReceitasService } from './receitas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('receitas')
@ApiBearerAuth()
@Controller('receitas')
@UseGuards(JwtAuthGuard)
export class ReceitasController {
  constructor(private readonly receitasService: ReceitasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar receita', description: 'Cria uma nova receita médica' })
  @ApiResponse({ status: 201, description: 'Receita criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createReceitaDto: any) {
    return this.receitasService.create(createReceitaDto);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Buscar receitas por paciente', description: 'Retorna todas as receitas de um paciente específico' })
  @ApiParam({ name: 'pacienteId', description: 'ID do paciente' })
  @ApiResponse({ status: 200, description: 'Lista de receitas do paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.receitasService.findByPacienteId(pacienteId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar receita', description: 'Atualiza os dados de uma receita existente' })
  @ApiParam({ name: 'id', description: 'ID da receita' })
  @ApiResponse({ status: 200, description: 'Receita atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Receita não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updateReceitaDto: any) {
    return this.receitasService.update(id, updateReceitaDto);
  }
}
