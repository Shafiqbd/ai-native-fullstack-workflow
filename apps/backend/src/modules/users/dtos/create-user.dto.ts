import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { CreateUserInput } from '@ai-workflow/shared-types';

/** Body for POST /api/users. */
export class CreateUserDto implements CreateUserInput {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
}
