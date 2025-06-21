import { ApiProperty } from '@nestjs/swagger';

class UserResponseDto {
  @ApiProperty({ description: 'ID único do usuário', example: 'uuid-do-usuario' })
  id: string;

  @ApiProperty({ description: 'Email do usuário', example: 'usuario@example.com' })
  email: string;

  @ApiProperty({ description: 'Nome do usuário', example: 'João Silva' })
  name: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT para autenticação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({ description: 'Dados do usuário', type: UserResponseDto })
  user: UserResponseDto;
}
