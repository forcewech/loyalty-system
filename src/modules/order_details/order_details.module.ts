import { Module } from '@nestjs/common';
import { OrderDetailsService } from './order_details.service';
import { OrderDetailsController } from './order_details.controller';
import { OrderDetail } from 'src/database';
import { SequelizeModule } from '@nestjs/sequelize';
import { StoresModule, UsersModule } from 'src/modules';
import { OrderDetailsRepository } from './order_details.repository';
import { RanksModule } from 'src/modules/ranks';

@Module({
  imports: [SequelizeModule.forFeature([OrderDetail]), UsersModule, StoresModule, RanksModule],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService, OrderDetailsRepository]
})
export class OrderDetailsModule {}
