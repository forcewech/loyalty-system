import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Gift } from 'src/database';
import { GiftsRepository } from './gifts.repository';

@Module({
  imports: [SequelizeModule.forFeature([Gift])],
  providers: [GiftsRepository],
  exports: [GiftsRepository]
})
export class GiftsModule {}
