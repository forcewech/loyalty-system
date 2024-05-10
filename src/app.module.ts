import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresqlModule } from './database/postgresql.module';
import { AdminModule, StoresModule, UsersModule } from './modules';

@Module({
  imports: [PostgresqlModule, StoresModule, UsersModule, AdminModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
