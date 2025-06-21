import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API completa para encurtamento de URLs com autenticação JWT')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('urls', 'Endpoints de URLs')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT para autenticação',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Servidor de Desenvolvimento')
    .setContact('Equipe de Desenvolvimento', 'https://example.com', 'dev@example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'URL Shortener API Docs',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
  });

  app.enableCors();

  await app.listen(3000);
  console.log('🚀 Servidor rodando em http://localhost:3000');
  console.log('📚 Documentação Swagger em http://localhost:3000/api/docs');
}
bootstrap();
