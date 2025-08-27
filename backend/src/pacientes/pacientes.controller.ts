import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pacientes')
@UseGuards(JwtAuthGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  create(@Body() createPacienteDto: any) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1', 
    @Query('limit') limit: string = '10',
    @Query('q') searchQuery?: string,
    @Query('nome') nome?: string,
    @Query('cpf') cpf?: string,
    @Query('rg') rg?: string,
    @Query('prontuario') prontuario?: string,
    @Query('sexo') sexo?: string,
    @Query('convenio') convenio?: string,
    @Query('email') email?: string,
    @Query('telefone') telefone?: string,
    @Query('celular') celular?: string,
    @Query('cidade') cidade?: string,
    @Query('estado') estado?: string
  ) {
    const filters = {
      searchQuery,
      nome,
      cpf,
      rg,
      prontuario,
      sexo,
      convenio,
      email,
      telefone,
      celular,
      cidade,
      estado
    };
    
    return this.pacientesService.findAll(+page, +limit, filters);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.pacientesService.search(query);
  }

  @Get('autocomplete/nomes')
  autocompleteNomes(@Query('q') query: string) {
    return this.pacientesService.autocompleteNomes(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Get(':id/next')
  getNext(@Param('id') id: string) {
    return this.pacientesService.getNextPaciente(id);
  }

  @Get(':id/previous')
  getPrevious(@Param('id') id: string) {
    return this.pacientesService.getPreviousPaciente(id);
  }

  @Get('prontuario/:prontuario')
  findByProntuario(@Param('prontuario') prontuario: string) {
    return this.pacientesService.findByProntuario(+prontuario);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePacienteDto: any) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(id);
  }
}
