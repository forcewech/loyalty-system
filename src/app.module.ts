import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresqlModule } from './database/postgresql.module';

@Module({
  imports: [PostgresqlModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
