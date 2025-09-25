import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExamesPreopService } from './exames-preop.service';
import { CreateExamePreopDto } from './dto/create-exame-preop.dto';
import { UpdateExamePreopDto } from './dto/update-exame-preop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

@ApiTags('exames-preop')
@UseGuards(JwtAuthGuard)
@Controller('exames-preop')
export class ExamesPreopController {
  constructor(private readonly examesPreopService: ExamesPreopService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo exame pré-operatório' })
  @ApiBody({
    description: 'Dados do exame pré-operatório',
    type: CreateExamePreopDto,
    examples: {
      exemplo1: {
        value: {
          paciente_id: '6d93bac84524ef0e9922ae9',
          nome_paciente: 'NOME DO PACIENTE',
          status: 'pendente',
          observacoes_geral: 'Observações gerais sobre o exame'
        }
      }
    }
  })
  create(@Body() createExamePreopDto: CreateExamePreopDto) {
    return this.examesPreopService.create(createExamePreopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os exames pré-operatórios' })
  findAll() {
    return this.examesPreopService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar exame pré-operatório por ID' })
  findOne(@Param('id') id: string) {
    return this.examesPreopService.findOne(id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Buscar exame pré-operatório por ID do paciente' })
  @ApiParam({
    name: 'pacienteId',
    description: 'ID do paciente',
    example: '6d93bac84524ef0e9922ae9'
  })
  findByPacienteId(@Param('pacienteId') pacienteId: string) {
    return this.examesPreopService.findByPacienteId(pacienteId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar exame pré-operatório' })
  update(@Param('id') id: string, @Body() updateExamePreopDto: UpdateExamePreopDto) {
    return this.examesPreopService.update(id, updateExamePreopDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover exame pré-operatório' })
  remove(@Param('id') id: string) {
    return this.examesPreopService.remove(id);
  }

  @Post('upload/:pacienteId/:fieldName')
  @ApiOperation({ summary: 'Fazer upload de arquivo para um campo específico' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'pacienteId',
    description: 'ID do paciente',
    example: '6d93bac84524ef0e9922ae9'
  })
  @ApiParam({
    name: 'fieldName',
    description: 'Nome do campo para upload (exames, usg, eda, rx, ecg, eco, polissonografia, outros)',
    example: 'exames'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo a ser enviado (até 10MB)'
        },
        observacoes: {
          type: 'string',
          description: 'Observações sobre o arquivo',
          example: 'Exame realizado em 25/09/2025'
        }
      },
      required: ['file']
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  async uploadFile(
    @UploadedFile() file: any, // Usando any para evitar problemas de tipo
    @Param('pacienteId') pacienteId: string,
    @Param('fieldName') fieldName: string,
    @Body('observacoes') observacoes?: string
  ) {
    // Converter o arquivo para Base64
    const arquivo_binario = file.buffer.toString('base64');
    
    return this.examesPreopService.uploadFile(pacienteId, fieldName, {
      nome_arquivo: file.originalname,
      arquivo_binario,
      mime_type: file.mimetype,
      observacoes
    });
  }

  @Get('file/:pacienteId/:fieldName')
  @ApiOperation({ summary: 'Buscar arquivo de um campo específico' })
  @ApiParam({
    name: 'pacienteId',
    description: 'ID do paciente',
    example: '6d93bac84524ef0e9922ae9'
  })
  @ApiParam({
    name: 'fieldName',
    description: 'Nome do campo para download (exames, usg, eda, rx, ecg, eco, polissonografia, outros)',
    example: 'exames'
  })
  async getFile(
    @Param('pacienteId') pacienteId: string,
    @Param('fieldName') fieldName: string,
    @Res() res: Response
  ) {
    try {
      const file = await this.examesPreopService.getFile(pacienteId, fieldName);
      
      // Converter Base64 para Buffer
      const fileBuffer = Buffer.from(file.arquivo_binario, 'base64');
      
      // Configurar cabeçalhos da resposta
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Content-Disposition', `inline; filename="${file.nome_arquivo}"`);
      
      // Enviar o arquivo
      res.send(fileBuffer);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  @Delete('file/:pacienteId/:fieldName')
  @ApiOperation({ summary: 'Remover arquivo de um campo específico' })
  @ApiParam({
    name: 'pacienteId',
    description: 'ID do paciente',
    example: '6d93bac84524ef0e9922ae9'
  })
  @ApiParam({
    name: 'fieldName',
    description: 'Nome do campo para remoção (exames, usg, eda, rx, ecg, eco, polissonografia, outros)',
    example: 'exames'
  })
  async removeFile(
    @Param('pacienteId') pacienteId: string,
    @Param('fieldName') fieldName: string
  ) {
    return this.examesPreopService.removeFile(pacienteId, fieldName);
  }
}
