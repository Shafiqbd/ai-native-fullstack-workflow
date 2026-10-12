import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { CreateProjectInput } from '@ai-workflow/shared-types';

/** Body for POST /api/projects. */
export class CreateProjectDto implements CreateProjectInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsInt()
  ownerId!: number;
}
