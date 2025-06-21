import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsNotEmpty } from 'class-validator';

export class UpdateUrlDto {
  @ApiProperty({
    description: 'Nova URL de destino',
    example: 'https://www.github.com/nestjs',
  })
  @IsUrl({}, { message: 'Por favor, forneça uma URL válida' })
  @IsNotEmpty({ message: 'URL é obrigatória' })
  originalUrl: string;
}
