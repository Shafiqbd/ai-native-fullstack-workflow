import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Body for POST /api/users. */
export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
}
