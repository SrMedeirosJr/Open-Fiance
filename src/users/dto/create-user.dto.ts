import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword', description: 'Senha do usuário (mínimo 6 caracteres)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
