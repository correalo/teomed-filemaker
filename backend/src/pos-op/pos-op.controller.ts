import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PosOpService } from './pos-op.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pos-op')
@UseGuards(JwtAuthGuard)
export class PosOpController {
  constructor(private readonly posOpService: PosOpService) {}

  @Get('evolucao/:evolucaoId')
  async findByEvolucaoId(@Param('evolucaoId') evolucaoId: string) {
    return this.posOpService.findByEvolucaoId(evolucaoId);
  }

  @Post('upload/:pacienteId/:evolucaoId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @Param('pacienteId') pacienteId: string,
    @Param('evolucaoId') evolucaoId: string,
    @UploadedFiles() files: Array<any>,
    @Body('nome_paciente') nomePaciente: string,
    @Body('data_pos_op') dataPosOp: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    return this.posOpService.uploadFile(pacienteId, evolucaoId, files, nomePaciente, dataPosOp);
  }

  @Put('conduta/:evolucaoId')
  async updateCondutaTratamentos(
    @Param('evolucaoId') evolucaoId: string,
    @Body('conduta_tratamentos') condutaTratamentos: string,
  ) {
    return this.posOpService.updateCondutaTratamentos(evolucaoId, condutaTratamentos);
  }

  @Get('file/:evolucaoId/:nomeArquivo')
  async getFile(
    @Param('evolucaoId') evolucaoId: string,
    @Param('nomeArquivo') nomeArquivo: string,
    @Res() res: Response,
  ) {
    const fileBuffer = await this.posOpService.getFile(evolucaoId, nomeArquivo);
    
    // Detectar tipo de arquivo
    const ext = nomeArquivo.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (['jpg', 'jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'heic') contentType = 'image/heic';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${nomeArquivo}"`,
    });

    res.send(fileBuffer);
  }

  @Delete('file/:evolucaoId/:nomeArquivo')
  async removeFile(
    @Param('evolucaoId') evolucaoId: string,
    @Param('nomeArquivo') nomeArquivo: string,
  ) {
    return this.posOpService.removeFile(evolucaoId, nomeArquivo);
  }

  @Put('file/:evolucaoId/:nomeArquivo')
  async updateFileName(
    @Param('evolucaoId') evolucaoId: string,
    @Param('nomeArquivo') nomeArquivo: string,
    @Body('novo_nome_original') novoNomeOriginal: string,
  ) {
    return this.posOpService.updateFileName(evolucaoId, nomeArquivo, novoNomeOriginal);
  }
}
