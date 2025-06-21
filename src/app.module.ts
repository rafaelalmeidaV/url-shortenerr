import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UrlModule } from './url-shortener/url.module';
import { LivenessReadinessController } from './liveness-readness/liveness-readiness.controller';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UrlModule,
  ],
  controllers: [LivenessReadinessController],
  providers: [],
})
export class AppModule {}
