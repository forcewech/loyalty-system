import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { application } from './configs';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.setGlobalPrefix(application.urlPrefix);
  await app.listen(application.serverPort);
}
bootstrap();
