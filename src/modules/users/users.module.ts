import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/database';
import { GiftsModule } from '../gifts/gifts.module';
import { OrderRedeemDetailsModule } from '../order_redeem_details';
import { OrderRedeemsModule } from '../order_redeems';
import { ProductStoresModule } from '../product_stores';
import { RefreshTokensModule } from '../refresh_tokens';
import { TwilioModule } from '../twilio/twilio.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    TwilioModule,
    GiftsModule,
    RefreshTokensModule,
    OrderRedeemDetailsModule,
    OrderRedeemsModule,
    ProductStoresModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}
