import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { StoresRepository } from './stores.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store } from 'src/database';

@Module({
  imports: [SequelizeModule.forFeature([Store])],
  controllers: [StoresController],
  providers: [StoresService, StoresRepository]
})
export class StoresModule {}
