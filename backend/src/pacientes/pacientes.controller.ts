import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PacientesService } from './pacientes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('pacientes')
@ApiBearerAuth()
@Controller('pacientes')
@UseGuards(JwtAuthGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar paciente', description: 'Cria um novo registro de paciente' })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createPacienteDto: any) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pacientes', description: 'Retorna uma lista paginada de pacientes com opções de filtro' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de itens por página', type: Number })
  @ApiQuery({ name: 'q', required: false, description: 'Termo de busca geral', type: String })
  @ApiQuery({ name: 'nome', required: false, description: 'Filtro por nome', type: String })
  @ApiQuery({ name: 'cpf', required: false, description: 'Filtro por CPF', type: String })
  @ApiQuery({ name: 'rg', required: false, description: 'Filtro por RG', type: String })
  @ApiQuery({ name: 'prontuario', required: false, description: 'Filtro por número de prontuário', type: String })
  @ApiQuery({ name: 'sexo', required: false, description: 'Filtro por sexo', type: String })
  @ApiQuery({ name: 'convenio', required: false, description: 'Filtro por convênio', type: String })
  @ApiResponse({ status: 200, description: 'Lista de pacientes retornada com sucesso' })
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
  @ApiOperation({ summary: 'Buscar pacientes', description: 'Busca pacientes por termo de pesquisa' })
  @ApiQuery({ name: 'q', required: true, description: 'Termo de busca', type: String })
  @ApiResponse({ status: 200, description: 'Resultados da busca' })
  search(@Query('q') query: string) {
    return this.pacientesService.search(query);
  }

  @Get('autocomplete/nomes')
  @ApiOperation({ summary: 'Autocompletar nomes', description: 'Retorna sugestões de nomes para autocompletar' })
  @ApiQuery({ name: 'q', required: true, description: 'Termo para autocompletar', type: String })
  @ApiResponse({ status: 200, description: 'Lista de sugestões' })
  autocompleteNomes(@Query('q') query: string) {
    return this.pacientesService.autocompleteNomes(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente por ID', description: 'Retorna os dados de um paciente específico' })
  @ApiParam({ name: 'id', description: 'ID do paciente' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Get(':id/next')
  @ApiOperation({ summary: 'Próximo paciente', description: 'Retorna o próximo paciente na sequência' })
  @ApiParam({ name: 'id', description: 'ID do paciente atual' })
  @ApiResponse({ status: 200, description: 'Próximo paciente' })
  @ApiResponse({ status: 404, description: 'Não há próximo paciente' })
  getNext(@Param('id') id: string) {
    return this.pacientesService.getNextPaciente(id);
  }

  @Get(':id/previous')
  @ApiOperation({ summary: 'Paciente anterior', description: 'Retorna o paciente anterior na sequência' })
  @ApiParam({ name: 'id', description: 'ID do paciente atual' })
  @ApiResponse({ status: 200, description: 'Paciente anterior' })
  @ApiResponse({ status: 404, description: 'Não há paciente anterior' })
  getPrevious(@Param('id') id: string) {
    return this.pacientesService.getPreviousPaciente(id);
  }

  @Get('prontuario/:prontuario')
  @ApiOperation({ summary: 'Buscar por prontuário', description: 'Busca paciente pelo número de prontuário' })
  @ApiParam({ name: 'prontuario', description: 'Número do prontuário' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  findByProntuario(@Param('prontuario') prontuario: string) {
    return this.pacientesService.findByProntuario(+prontuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar paciente', description: 'Atualiza os dados de um paciente existente' })
  @ApiParam({ name: 'id', description: 'ID do paciente' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updatePacienteDto: any) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover paciente', description: 'Remove um paciente do sistema' })
  @ApiParam({ name: 'id', description: 'ID do paciente' })
  @ApiResponse({ status: 200, description: 'Paciente removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(id);
  }

  @Post(':id/hma/audio')
  @UseInterceptors(FileInterceptor('audio', {
    storage: diskStorage({
      destination: './uploads/hma/audio',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `hma-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(wav|mp3|m4a|webm|ogg)$/)) {
        return cb(new Error('Apenas arquivos de áudio são permitidos!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  }))
  @ApiOperation({ summary: 'Upload de áudio HMA', description: 'Faz upload do áudio da HMA e retorna a transcrição' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID do paciente' })
  @ApiResponse({ status: 200, description: 'Áudio enviado e transcrito com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  async uploadHmaAudio(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.pacientesService.uploadHmaAudio(id, file);
  }

  @Post(':id/hma/pdf')
  @UseInterceptors(FileInterceptor('pdf', {
    storage: diskStorage({
      destination: './uploads/hma/pdf',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `hma-resumo-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Apenas arquivos PDF são permitidos!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  @ApiOperation({ summary: 'Upload de PDF resumo HMA', description: 'Faz upload do PDF do resumo da HMA' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pdf: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID do paciente' })
  @ApiResponse({ status: 200, description: 'PDF enviado com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  async uploadHmaPdf(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.pacientesService.uploadHmaPdf(id, file);
  }
}
