import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EvolucoesService } from './evolucoes.service';
import { CreateEvolucaoDto } from './dto/create-evolucao.dto';
import { UpdateEvolucaoDto } from './dto/update-evolucao.dto';

@Controller('evolucoes')
export class EvolucoesController {
  constructor(private readonly evolucoesService: EvolucoesService) {}

  @Post()
  create(@Body() createEvolucaoDto: CreateEvolucaoDto) {
    return this.evolucoesService.create(createEvolucaoDto);
  }

  @Get()
  findAll(@Query() query) {
    // Normalizar parâmetros
    const searchParams: any = {};
    
    // Aceitar tanto pacienteId quanto paciente_id para compatibilidade
    if (query.pacienteId || query.paciente_id) {
      searchParams.paciente_id = query.pacienteId || query.paciente_id;
    }
    
    // Adicionar nome do paciente se existir
    if (query.nome_paciente) {
      searchParams.nome_paciente = query.nome_paciente;
    }
    
    // Adicionar outros parâmetros de busca
    Object.keys(query).forEach(key => {
      if (key !== 'pacienteId' && !searchParams[key]) {
        searchParams[key] = query[key];
      }
    });
    
    console.log(`Buscando evoluções com parâmetros:`, searchParams);
    
    // Se tiver algum parâmetro de busca, usar o método search
    if (Object.keys(searchParams).length > 0) {
      return this.evolucoesService.search(searchParams);
    }
    
    // Se não tiver parâmetros, retornar todas as evoluções
    return this.evolucoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evolucoesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvolucaoDto: UpdateEvolucaoDto) {
    return this.evolucoesService.update(id, updateEvolucaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evolucoesService.remove(id);
  }
}
