import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Body for PATCH /api/users/:id. All fields optional; omitted fields
 * are left unchanged. Hand-written (instead of PartialType) to keep
 * the dependency set minimal.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;
}
