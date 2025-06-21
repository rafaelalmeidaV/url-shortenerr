import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    description: 'URL original que será encurtada',
    example: 'https://www.google.com/search?q=nestjs',
    format: 'url',
  })
  @IsUrl({}, { message: 'Por favor, forneça uma URL válida' })
  @IsNotEmpty({ message: 'URL é obrigatória' })
  originalUrl: string;

  @ApiProperty({
    description: 'Alias personalizado para a URL (opcional)',
    example: 'meu-link',
    required: false,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  customAlias?: string;
}
