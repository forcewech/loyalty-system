import { Module } from '@nestjs/common';
import { GiftsService } from './gifts.service';
import { GiftsController } from './gifts.controller';
import { GiftsRepository } from './gifts.repository';
import { Gift } from 'src/database';
import { SequelizeModule } from '@nestjs/sequelize';
import { UploadsModule } from '../upload/uploads.module';

@Module({
  imports: [SequelizeModule.forFeature([Gift]), UploadsModule],
  controllers: [GiftsController],
  providers: [GiftsService, GiftsRepository],
  exports: [GiftsRepository]
})
export class GiftsModule {}
