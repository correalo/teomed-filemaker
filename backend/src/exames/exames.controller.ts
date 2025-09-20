import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, Res } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { ExamesService } from './exames.service';
import { CreateExameDto } from './dto/create-exame.dto';
import { UpdateExameDto } from './dto/update-exame.dto';

@Controller('exames')
export class ExamesController {
  constructor(private readonly examesService: ExamesService) {}

  @Post()
  create(@Body() createExameDto: CreateExameDto) {
    return this.examesService.create(createExameDto);
  }

  @Get()
  findAll() {
    return this.examesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examesService.findOne(id);
  }

  @Get('paciente/:pacienteId')
  findByPacienteId(@Param('pacienteId') pacienteId: string) {
    return this.examesService.findByPacienteId(pacienteId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExameDto: UpdateExameDto) {
    return this.examesService.update(id, updateExameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examesService.remove(id);
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
        fileSize: 10 * 1024 * 1024, // 10MB
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

    const validFields = ['laboratoriais', 'usg', 'eda', 'colono', 'anatomia_patologica', 'tomografia', 'bioimpedancia', 'outros', 'outros2'];
    if (!validFields.includes(fieldName)) {
      throw new BadRequestException('Campo inválido');
    }

    let exame = await this.examesService.findByPacienteId(pacienteId);
    if (!exame) {
      exame = await this.examesService.create({
        paciente_id: pacienteId,
        nome_paciente: nomePaciente || '',
        [fieldName]: [],
      } as CreateExameDto);
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

      exame = await this.examesService.addFileToField(
        pacienteId,
        fieldName,
        fileInfo
      );
    }

    return {
      message: `${files.length} arquivo(s) enviado(s) com sucesso`,
      exame,
    };
  }

  @Get('file/:pacienteId/:fieldName/:fileName')
  async getFile(
    @Param('pacienteId') pacienteId: string,
    @Param('fieldName') fieldName: string,
    @Param('fileName') fileName: string,
    @Res() res: any
  ) {
    const exame = await this.examesService.findByPacienteId(pacienteId);
    if (!exame || !exame[fieldName]) {
      throw new BadRequestException('Arquivo não encontrado');
    }

    const file = exame[fieldName].find(f => f.nome_arquivo === fileName);
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
    const validFields = ['laboratoriais', 'usg', 'eda', 'colono', 'anatomia_patologica', 'tomografia', 'bioimpedancia', 'outros', 'outros2'];
    if (!validFields.includes(fieldName)) {
      throw new BadRequestException('Campo inválido');
    }

    return this.examesService.removeFileFromField(pacienteId, fieldName, fileName);
  }
}
