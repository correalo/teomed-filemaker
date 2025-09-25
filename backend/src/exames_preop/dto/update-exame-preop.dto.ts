import { PartialType } from '@nestjs/mapped-types';
import { CreateExamePreopDto } from './create-exame-preop.dto';

export class UpdateExamePreopDto extends PartialType(CreateExamePreopDto) {}
