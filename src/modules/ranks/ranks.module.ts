import { Module } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { RanksController } from './ranks.controller';
import { Rank } from 'src/database';
import { SequelizeModule } from '@nestjs/sequelize';
import { RanksRepository } from './ranks.repository';

@Module({
  imports: [SequelizeModule.forFeature([Rank])],
  controllers: [RanksController],
  providers: [RanksService, RanksRepository]
})
export class RanksModule {}
