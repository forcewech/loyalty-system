import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderRedeemDetail } from 'src/database';
import { OrderRedeemDetailsRepository } from './order_redeem_details.repository';

@Module({
  imports: [SequelizeModule.forFeature([OrderRedeemDetail])],
  providers: [OrderRedeemDetailsRepository],
  exports: [OrderRedeemDetailsRepository]
})
export class OrderRedeemDetailsModule {}
