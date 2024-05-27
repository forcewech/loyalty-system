import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { application } from './configs';
import { HttpExceptionFilter, TransformInterceptor, ValidationPipe } from './utils';
import { connectRedis } from './configs/connectRedis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  connectRedis();
  app.setGlobalPrefix(application.urlPrefix);
  await app.listen(application.serverPort);
}
bootstrap();
