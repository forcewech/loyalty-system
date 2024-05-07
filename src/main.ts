import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { application } from './configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(application.urlPrefix);
  await app.listen(application.serverPort);
}
bootstrap();
