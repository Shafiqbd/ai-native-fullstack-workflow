import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { UpdateProjectInput } from '@ai-workflow/shared-types';

/** Body for PATCH /api/projects/:id. All fields optional. */
export class UpdateProjectDto implements UpdateProjectInput {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsInt()
  ownerId?: number;
}
