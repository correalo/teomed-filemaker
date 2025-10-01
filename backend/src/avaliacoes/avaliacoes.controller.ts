import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';

@Controller('avaliacoes')
@UseGuards(JwtAuthGuard)
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacoesService.create(createAvaliacaoDto);
  }

  @Get()
  findAll() {
    return this.avaliacoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avaliacoesService.findOne(id);
  }

  @Get('paciente/:pacienteId')
  findByPacienteId(@Param('pacienteId') pacienteId: string) {
    return this.avaliacoesService.findByPacienteId(pacienteId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAvaliacaoDto: UpdateAvaliacaoDto) {
    return this.avaliacoesService.update(id, updateAvaliacaoDto);
  }

  @Patch('paciente/:pacienteId')
  updateByPacienteId(
    @Param('pacienteId') pacienteId: string,
    @Body() updateAvaliacaoDto: UpdateAvaliacaoDto
  ) {
    return this.avaliacoesService.updateByPacienteId(pacienteId, updateAvaliacaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.avaliacoesService.remove(id);
  }

  @Post('upload/:pacienteId/:fieldName')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(), // Usar memória para armazenar arquivos como Buffer
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'image/heic',
          'image/jpeg',
          'image/jpg',
          'image/png'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de arquivo não permitido'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    })
  )
  async uploadFiles(
    @Param('pacienteId') pacienteId: string,
    @Param('fieldName') fieldName: string,
    @UploadedFiles() files: any[],
    @Body('nome_paciente') nomePaciente?: string
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const validFields = ['cardiologista', 'endocrino', 'nutricionista', 'psicologa', 'outros', 'outros2'];
    if (!validFields.includes(fieldName)) {
      throw new BadRequestException('Campo inválido');
    }

    let avaliacao = await this.avaliacoesService.findByPacienteId(pacienteId);
    if (!avaliacao) {
      avaliacao = await this.avaliacoesService.create({
        paciente_id: pacienteId,
        nome_paciente: nomePaciente || '',
        [fieldName]: [],
      } as CreateAvaliacaoDto);
    }

    // Adicionar cada arquivo
    for (const file of files) {
      const fileInfo = {
        nome_original: file.originalname,
        nome_arquivo: `${randomUUID()}_${file.originalname}`,
        tipo: file.mimetype,
        tamanho: file.size,
        data: file.buffer.toString('base64'), // Converter para Base64 (binário 64 bits)
      };

      avaliacao = await this.avaliacoesService.addFileToField(
        pacienteId,
        fieldName,
        fileInfo
      );
    }

    return {
      message: `${files.length} arquivo(s) enviado(s) com sucesso`,
      avaliacao,
    };
  }

  @Get('file/:pacienteId/:fieldName/:fileName')
  async getFile(
    @Param('pacienteId') pacienteId: string,
    @Param('fieldName') fieldName: string,
    @Param('fileName') fileName: string,
    @Res() res: any
  ) {
    const avaliacao = await this.avaliacoesService.findByPacienteId(pacienteId);
    if (!avaliacao || !avaliacao[fieldName]) {
      throw new BadRequestException('Arquivo não encontrado');
    }

    const file = avaliacao[fieldName].find(f => f.nome_arquivo === fileName);
    if (!file) {
      throw new BadRequestException('Arquivo não encontrado');
    }

    res.set({
      'Content-Type': file.tipo,
      'Content-Disposition': `inline; filename="${file.nome_original}"`,
    });
    
    // Converter de Base64 para Buffer antes de enviar
    const fileBuffer = Buffer.from(file.data, 'base64');
    return res.send(fileBuffer);
  }

  @Delete('file/:pacienteId/:fieldName/:fileName')
  async removeFile(
    @Param('pacienteId') pacienteId: string,
    @Param('fieldName') fieldName: string,
    @Param('fileName') fileName: string
  ) {
    const validFields = ['cardiologista', 'endocrino', 'nutricionista', 'psicologa', 'outros', 'outros2'];
    if (!validFields.includes(fieldName)) {
      throw new BadRequestException('Campo inválido');
    }

    return this.avaliacoesService.removeFileFromField(pacienteId, fieldName, fileName);
  }
}
