import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderRedeem } from 'src/database';
import { OrderRedeemsRepository } from './order_redeems.repository';

@Module({
  imports: [SequelizeModule.forFeature([OrderRedeem])],
  providers: [OrderRedeemsRepository],
  exports: [OrderRedeemsRepository]
})
export class OrderRedeemsModule {}
