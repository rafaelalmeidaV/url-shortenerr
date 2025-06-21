import { ApiProperty } from '@nestjs/swagger';

class UserBasicDto {
  @ApiProperty({ description: 'ID do usuário', example: 'uuid-do-usuario' })
  id: string;

  @ApiProperty({ description: 'Nome do usuário', example: 'João Silva' })
  name: string;

  @ApiProperty({ description: 'Email do usuário', example: 'usuario@example.com' })
  email: string;
}

export class UrlResponseDto {
  @ApiProperty({ description: 'ID único da URL', example: 'uuid-da-url' })
  id: string;

  @ApiProperty({
    description: 'URL original',
    example: 'https://www.google.com',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'URL encurtada completa',
    example: 'http://localhost:3000/aBc123',
  })
  shortUrl: string;

  @ApiProperty({
    description: 'Código curto da URL',
    example: 'aBc123',
  })
  shortCode: string;

  @ApiProperty({
    description: 'Número de cliques na URL',
    example: 42,
  })
  clicks: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-06-21T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-06-21T15:45:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Data de expiração (opcional)',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'ID do usuário proprietário (se autenticado)',
    example: 'uuid-do-usuario',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'Dados do usuário proprietário',
    type: UserBasicDto,
    required: false,
  })
  user?: UserBasicDto;
}
